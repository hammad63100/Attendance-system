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
    exportExcel(filters: any): Promise<any>;
    getDashboardStats(): Promise<{
        totalStudents: number;
        totalDevices: number;
        todayStats: {
            present: number;
            absent: number;
            late: number;
            leave: number;
        };
        trend: {
            date: string;
            fullDate: string;
            present: number;
            absent: number;
            leave: number;
        }[];
    }>;
    markLeave(userId: string, dateStr: string): Promise<{
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
    }>;
    getSubjects(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
    }[]>;
}
