import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LogsService {
    private readonly logger = new Logger(LogsService.name);

    constructor(private prisma: PrismaService) { }

    async handleManualUpload(deviceId: string, logs: any[]) {
        let inserted = 0;
        for (const log of logs) {
            try {
                await this.prisma.rawLog.create({
                    data: {
                        deviceId,
                        deviceUserId: log.userId?.toString() || 'unknown',
                        logTime: new Date(log.timestamp),
                        verifyType: log.verifyType || 'finger',
                        inOut: log.inOut || 'IN',
                        rawPayload: log,
                    }
                });
                inserted++;
            } catch (err) {
                this.logger.error(`Failed to insert log for device ${deviceId}`, err.stack);
            }
        }
        return { message: `Inserted ${inserted} logs successfully.` };
    }

    async handleWebhook(deviceId: string, payload: any) {
        // Assume webhook payload is a single log or array
        const logs = Array.isArray(payload) ? payload : [payload];
        return this.handleManualUpload(deviceId, logs);
    }

    @Cron(CronExpression.EVERY_HOUR)
    async pullLogsFromDevices() {
        this.logger.log('Running periodic log pull from all devices...');
        const devices = await this.prisma.device.findMany();
        for (const device of devices) {
            this.logger.debug(`Pulling logs from device ${device.name} (${device.ip})`);
            // TODO: Implement actual SDK/TCP call to device to pull new logs
            // e.g., const newLogs = await ZKLib.getAttendances();
            // await this.handleManualUpload(device.id, newLogs);
        }
    }
}
