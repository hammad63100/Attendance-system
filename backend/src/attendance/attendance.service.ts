import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AttendanceService {
    private readonly logger = new Logger(AttendanceService.name);

    constructor(private prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async processUnprocessedLogs() {
        this.logger.debug('Starting raw logs processing job...');
        // In a real app, track the last processed log ID or timestamp.
        // For MVP, we'll fetch logs from the last 24 hours.
        const recentLogs = await this.prisma.rawLog.findMany({
            where: {
                logTime: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { logTime: 'asc' }
        });

        for (const log of recentLogs) {
            await this.processLog(log);
        }
    }

    private async processLog(log: any) {
        // Map deviceUserId to systemUserId
        const mapping = await this.prisma.userMapping.findUnique({
            where: {
                deviceId_deviceUserId: {
                    deviceId: log.deviceId,
                    deviceUserId: log.deviceUserId
                }
            }
        });

        if (!mapping) return; // User not mapped to system

        const logDate = new Date(log.logTime);
        logDate.setHours(0, 0, 0, 0); // Normalize to date only

        // Check for existing processed attendance for this user/date
        let attendance = await this.prisma.processedAttendance.findFirst({
            where: { userId: mapping.systemUserId, date: logDate }
        });

        // Fraud prevention: Ignore duplicate scans within 5 minutes
        if (attendance && attendance.lastCheckOut && (log.logTime.getTime() - attendance.lastCheckOut.getTime() < 5 * 60000)) {
            return;
        }

        if (!attendance) {
            // First check-in
            const shiftStart = new Date(logDate);
            shiftStart.setHours(8, 30, 0, 0); // Assuming 08:30 start time

            const diffMinutes = Math.floor((log.logTime.getTime() - shiftStart.getTime()) / 60000);
            const status = diffMinutes > 15 ? 'LATE' : 'PRESENT';
            const minutesLate = diffMinutes > 0 ? diffMinutes : 0;

            await this.prisma.processedAttendance.create({
                data: {
                    userId: mapping.systemUserId,
                    date: logDate,
                    firstCheckIn: log.logTime,
                    lastCheckOut: log.logTime,
                    status,
                    minutesLate,
                    sourceDeviceId: log.deviceId
                }
            });
        } else {
            // Update last checkout
            await this.prisma.processedAttendance.update({
                where: { id: attendance.id },
                data: {
                    lastCheckOut: log.logTime
                }
            });
        }
    }
}
