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
var AttendanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
let AttendanceService = AttendanceService_1 = class AttendanceService {
    prisma;
    logger = new common_1.Logger(AttendanceService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processUnprocessedLogs() {
        this.logger.debug('Starting raw logs processing job...');
        const recentLogs = await this.prisma.rawLog.findMany({
            where: {
                logTime: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { logTime: 'asc' }
        });
        for (const log of recentLogs) {
            await this.processLog(log);
        }
    }
    async processLog(log) {
        const mapping = await this.prisma.userMapping.findUnique({
            where: {
                deviceId_deviceUserId: {
                    deviceId: log.deviceId,
                    deviceUserId: log.deviceUserId
                }
            }
        });
        if (!mapping)
            return;
        const logDate = new Date(log.logTime);
        logDate.setHours(0, 0, 0, 0);
        let attendance = await this.prisma.processedAttendance.findFirst({
            where: { userId: mapping.systemUserId, date: logDate }
        });
        if (attendance && attendance.lastCheckOut && (log.logTime.getTime() - attendance.lastCheckOut.getTime() < 5 * 60000)) {
            return;
        }
        if (!attendance) {
            const shiftStart = new Date(logDate);
            shiftStart.setHours(8, 30, 0, 0);
            const diffMinutes = Math.floor((log.logTime.getTime() - shiftStart.getTime()) / 60000);
            const status = diffMinutes > 15 ? 'LATE' : 'PRESENT';
            const minutesLate = diffMinutes > 0 ? diffMinutes : 0;
            await this.prisma.processedAttendance.create({
                data: {
                    userId: mapping.systemUserId,
                    date: logDate,
                    firstCheckIn: log.logTime,
                    lastCheckOut: log.logTime,
                    status,
                    minutesLate,
                    sourceDeviceId: log.deviceId
                }
            });
        }
        else {
            await this.prisma.processedAttendance.update({
                where: { id: attendance.id },
                data: {
                    lastCheckOut: log.logTime
                }
            });
        }
    }
};
exports.AttendanceService = AttendanceService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceService.prototype, "processUnprocessedLogs", null);
exports.AttendanceService = AttendanceService = AttendanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map