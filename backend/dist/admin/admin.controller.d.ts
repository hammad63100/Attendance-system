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
}
