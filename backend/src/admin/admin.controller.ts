import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
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

    @Get('attendance/export-excel')
    async exportExcel(@Query() filters: any, @Res() res: any) {
        const buffer = await this.adminService.exportExcel(filters);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="attendance-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }

    @Get('dashboard-stats')
    getDashboardStats() {
        return this.adminService.getDashboardStats();
    }

    @Post('attendance/leave')
    markLeave(@Body() body: { userId: string, date: string }) {
        return this.adminService.markLeave(body.userId, body.date);
    }

    @Get('subjects')
    getSubjects() {
        return this.adminService.getSubjects();
    }
}
