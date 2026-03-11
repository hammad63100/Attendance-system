import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
    exportAttendance(filters: any): Promise<{
        status: string;
        downloadUrl: string;
        recordCount: number;
    }>;
    exportExcel(filters: any, res: any): Promise<void>;
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
    markLeave(body: {
        userId: string;
        date: string;
    }): Promise<{
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
