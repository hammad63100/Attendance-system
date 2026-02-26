import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getAttendance(filters: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        date: Date;
        firstCheckIn: Date | null;
        lastCheckOut: Date | null;
        minutesLate: number;
        sourceDeviceId: string | null;
    }[]>;
    generateAttendancePDF(filters: any): Promise<{
        status: string;
        downloadUrl: string;
        recordCount: number;
    }>;
}
