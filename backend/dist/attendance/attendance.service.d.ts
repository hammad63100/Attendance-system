import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processUnprocessedLogs(): Promise<void>;
    private processLog;
}
