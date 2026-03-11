"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const xlsx = __importStar(require("xlsx"));
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
        if (filters.subjectId) {
            const enrollments = await this.prisma.enrollment.findMany({
                where: { subjectId: filters.subjectId }
            });
            const studentIds = enrollments.map(e => e.systemUserId);
            if (where.userId) {
                if (!studentIds.includes(where.userId)) {
                    return [];
                }
            }
            else {
                where.userId = { in: studentIds };
            }
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
    async exportExcel(filters) {
        const data = await this.getAttendance(filters);
        const worksheetData = data.map(record => ({
            'Date': record.date.toISOString().split('T')[0],
            'User ID': record.userId,
            'First Check In': record.firstCheckIn ? new Date(record.firstCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            'Last Check Out': record.lastCheckOut ? new Date(record.lastCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
            'Status': record.status,
            'Minutes Late': record.minutesLate
        }));
        const ws = xlsx.utils.json_to_sheet(worksheetData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Attendance");
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        return buffer;
    }
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalStudents = await this.prisma.student.count();
        const totalDevices = await this.prisma.device.count();
        const todayAttendance = await this.prisma.processedAttendance.findMany({
            where: { date: today }
        });
        let present = 0;
        let absent = 0;
        let late = 0;
        let leave = 0;
        todayAttendance.forEach(a => {
            if (a.status === 'PRESENT')
                present++;
            else if (a.status === 'LATE')
                late++;
            else if (a.status === 'LEAVE')
                leave++;
            else if (a.status === 'ABSENT')
                absent++;
        });
        const recordedToday = present + late + leave + absent;
        absent += (totalStudents - recordedToday > 0) ? (totalStudents - recordedToday) : 0;
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const dayRecords = await this.prisma.processedAttendance.findMany({ where: { date: d } });
            let dPresent = 0;
            let dLate = 0;
            let dLeave = 0;
            let dAbsent = 0;
            dayRecords.forEach(a => {
                if (a.status === 'PRESENT')
                    dPresent++;
                else if (a.status === 'LATE')
                    dLate++;
                else if (a.status === 'LEAVE')
                    dLeave++;
                else if (a.status === 'ABSENT')
                    dAbsent++;
            });
            const recDay = dPresent + dLate + dLeave + dAbsent;
            dAbsent += (totalStudents - recDay > 0) ? (totalStudents - recDay) : 0;
            trend.push({
                date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: d.toISOString().split('T')[0],
                present: dPresent + dLate,
                absent: dAbsent,
                leave: dLeave
            });
        }
        return {
            totalStudents,
            totalDevices,
            todayStats: {
                present,
                absent,
                late,
                leave
            },
            trend
        };
    }
    async markLeave(userId, dateStr) {
        if (!userId || !dateStr) {
            throw new common_1.BadRequestException('User ID and date are required');
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        date.setHours(0, 0, 0, 0);
        const student = await this.prisma.student.findUnique({
            where: { studentId: userId }
        });
        if (!student) {
            throw new common_1.BadRequestException('Student not found');
        }
        const existing = await this.prisma.processedAttendance.findFirst({
            where: { userId, date }
        });
        if (existing) {
            return this.prisma.processedAttendance.update({
                where: { id: existing.id },
                data: { status: 'LEAVE', minutesLate: 0 }
            });
        }
        else {
            return this.prisma.processedAttendance.create({
                data: {
                    userId,
                    date,
                    status: 'LEAVE',
                    minutesLate: 0
                }
            });
        }
    }
    async getSubjects() {
        return this.prisma.subject.findMany({
            orderBy: { name: 'asc' }
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map