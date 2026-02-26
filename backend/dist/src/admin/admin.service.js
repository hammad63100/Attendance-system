"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAttendance(filters) {
        const where = {};
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
    async generateAttendancePDF(filters) {
        const data = await this.getAttendance(filters);
        return {
            status: 'success',
            downloadUrl: '/downloads/mock-attendance-report.pdf',
            recordCount: data.length
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map