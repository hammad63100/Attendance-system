import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('attendance')
    getAttendance(@Query() filters: any) {
        return this.adminService.getAttendance(filters);
    }

    @Get('attendance/export')
    exportAttendance(@Query() filters: any) {
        return this.adminService.generateAttendancePDF(filters);
    }
}
