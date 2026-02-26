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
var LogsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
let LogsService = LogsService_1 = class LogsService {
    prisma;
    logger = new common_1.Logger(LogsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleManualUpload(deviceId, logs) {
        let inserted = 0;
        for (const log of logs) {
            try {
                await this.prisma.rawLog.create({
                    data: {
                        deviceId,
                        deviceUserId: log.userId?.toString() || 'unknown',
                        logTime: new Date(log.timestamp),
                        verifyType: log.verifyType || 'finger',
                        inOut: log.inOut || 'IN',
                        rawPayload: log,
                    }
                });
                inserted++;
            }
            catch (err) {
                this.logger.error(`Failed to insert log for device ${deviceId}`, err.stack);
            }
        }
        return { message: `Inserted ${inserted} logs successfully.` };
    }
    async handleWebhook(deviceId, payload) {
        const logs = Array.isArray(payload) ? payload : [payload];
        return this.handleManualUpload(deviceId, logs);
    }
    async pullLogsFromDevices() {
        this.logger.log('Running periodic log pull from all devices...');
        const devices = await this.prisma.device.findMany();
        for (const device of devices) {
            this.logger.debug(`Pulling logs from device ${device.name} (${device.ip})`);
        }
    }
};
exports.LogsService = LogsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogsService.prototype, "pullLogsFromDevices", null);
exports.LogsService = LogsService = LogsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LogsService);
//# sourceMappingURL=logs.service.js.map