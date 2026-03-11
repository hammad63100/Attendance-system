import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as xlsx from 'xlsx';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getAttendance(filters: any) {
        const where: any = {};
        if (filters.date) {
            where.date = new Date(filters.date);
            where.date.setHours(0, 0, 0, 0);
        }
        if (filters.userId) {
            where.userId = filters.userId;
        }
        if (filters.campusId) {
            const devices = await this.prisma.device.findMany({ where: { campusId: filters.campusId } });
            where.sourceDeviceId = { in: devices.map(d => d.id) };
        }
        if (filters.subjectId) {
            const enrollments = await this.prisma.enrollment.findMany({
                where: { subjectId: filters.subjectId }
            });
            const studentIds = enrollments.map(e => e.systemUserId);

            if (where.userId) {
                // Only apply subject filter if the user is in that subject, otherwise return empty
                if (!studentIds.includes(where.userId)) {
                    return [];
                }
            } else {
                where.userId = { in: studentIds };
            }
        }

        return this.prisma.processedAttendance.findMany({
            where,
            orderBy: { date: 'desc' },
            take: 100
        });
    }

    async generateAttendancePDF(filters: any) {
        const data = await this.getAttendance(filters);
        // Mock PDF generation logic
        return {
            status: 'success',
            downloadUrl: '/downloads/mock-attendance-report.pdf',
            recordCount: data.length
        };
    }

    async exportExcel(filters: any) {
        const data = await this.getAttendance(filters);

        const worksheetData = data.map(record => ({
            'Date': record.date.toISOString().split('T')[0],
            'User ID': record.userId,
            'First Check In': record.firstCheckIn ? new Date(record.firstCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            'Last Check Out': record.lastCheckOut ? new Date(record.lastCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            'Status': record.status,
            'Minutes Late': record.minutesLate
        }));

        const ws = xlsx.utils.json_to_sheet(worksheetData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Attendance");
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        return buffer;
    }

    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalStudents = await this.prisma.student.count();
        const totalDevices = await this.prisma.device.count();

        // Today's attendance
        const todayAttendance = await this.prisma.processedAttendance.findMany({
            where: { date: today }
        });

        let present = 0;
        let absent = 0;
        let late = 0;
        let leave = 0;

        todayAttendance.forEach(a => {
            if (a.status === 'PRESENT') present++;
            else if (a.status === 'LATE') late++;
            else if (a.status === 'LEAVE') leave++;
            else if (a.status === 'ABSENT') absent++;
        });

        // Calculate naive absent if records don't exist for all students
        const recordedToday = present + late + leave + absent;
        absent += (totalStudents - recordedToday > 0) ? (totalStudents - recordedToday) : 0;

        // 7 days trend
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);

            const dayRecords = await this.prisma.processedAttendance.findMany({ where: { date: d } });

            let dPresent = 0;
            let dLate = 0;
            let dLeave = 0;
            let dAbsent = 0;

            dayRecords.forEach(a => {
                if (a.status === 'PRESENT') dPresent++;
                else if (a.status === 'LATE') dLate++;
                else if (a.status === 'LEAVE') dLeave++;
                else if (a.status === 'ABSENT') dAbsent++;
            });

            const recDay = dPresent + dLate + dLeave + dAbsent;
            dAbsent += (totalStudents - recDay > 0) ? (totalStudents - recDay) : 0;

            trend.push({
                date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: d.toISOString().split('T')[0],
                present: dPresent + dLate, // group late into present for simple trend
                absent: dAbsent,
                leave: dLeave
            });
        }

        return {
            totalStudents,
            totalDevices,
            todayStats: {
                present,
                absent,
                late,
                leave
            },
            trend
        };
    }

    async markLeave(userId: string, dateStr: string) {
        if (!userId || !dateStr) {
            throw new BadRequestException('User ID and date are required');
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new BadRequestException('Invalid date format');
        }
        date.setHours(0, 0, 0, 0);

        // Verify user exists first
        const student = await this.prisma.student.findUnique({
            where: { studentId: userId }
        });

        if (!student) {
            throw new BadRequestException('Student not found');
        }

        const existing = await this.prisma.processedAttendance.findFirst({
            where: { userId, date }
        });

        if (existing) {
            return this.prisma.processedAttendance.update({
                where: { id: existing.id },
                data: { status: 'LEAVE', minutesLate: 0 }
            });
        } else {
            return this.prisma.processedAttendance.create({
                data: {
                    userId,
                    date,
                    status: 'LEAVE',
                    minutesLate: 0
                }
            });
        }
    }

    async getSubjects() {
        return this.prisma.subject.findMany({
            orderBy: { name: 'asc' }
        });
    }
}
