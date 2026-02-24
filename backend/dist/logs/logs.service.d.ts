import { PrismaService } from '../prisma/prisma.service';
export declare class LogsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleManualUpload(deviceId: string, logs: any[]): Promise<{
        message: string;
    }>;
    handleWebhook(deviceId: string, payload: any): Promise<{
        message: string;
    }>;
    pullLogsFromDevices(): Promise<void>;
}
