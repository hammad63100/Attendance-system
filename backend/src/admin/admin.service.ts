import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
