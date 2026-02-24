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
var DevicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const ZKLib = require('node-zklib');
let DevicesService = DevicesService_1 = class DevicesService {
    prisma;
    logger = new common_1.Logger(DevicesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.device.create({ data });
    }
    async findAll() {
        return this.prisma.device.findMany();
    }
    async findOne(id) {
        const device = await this.prisma.device.findUnique({ where: { id } });
        if (!device)
            throw new common_1.NotFoundException('Device not found');
        return device;
    }
    async update(id, data) {
        return this.prisma.device.update({
            where: { id },
            data,
        }).catch(() => {
            throw new common_1.NotFoundException('Device not found');
        });
    }
    async remove(id) {
        return this.prisma.device.delete({ where: { id } }).catch(() => {
            throw new common_1.NotFoundException('Device not found');
        });
    }
    async connectToDevice(ip, port) {
        const zkInstance = new ZKLib(ip, port, 5200, 4000);
        try {
            await zkInstance.createSocket();
            return zkInstance;
        }
        catch (err) {
            this.logger.error(`Failed to connect to ZKTeco device at ${ip}:${port}`, err);
            throw new common_1.BadRequestException(`Cannot connect to device at ${ip}:${port}. Make sure the device is powered on and reachable on the network.`);
        }
    }
    async testConnection(id) {
        const device = await this.findOne(id);
        let zkInstance = null;
        try {
            zkInstance = await this.connectToDevice(device.ip, device.port);
            await this.update(id, { status: 'ONLINE', lastSyncTime: new Date() });
            return {
                status: 'success',
                message: `Successfully connected to ${device.name} at ${device.ip}:${device.port}`,
                device: { ...device, status: 'ONLINE' },
            };
        }
        catch (err) {
            await this.update(id, { status: 'OFFLINE' });
            return {
                status: 'error',
                message: `Cannot reach ${device.name} at ${device.ip}:${device.port}. Device is OFFLINE or unreachable.`,
                device: { ...device, status: 'OFFLINE' },
            };
        }
        finally {
            if (zkInstance) {
                try {
                    await zkInstance.disconnect();
                }
                catch (_) { }
            }
        }
    }
    async scanFingerprint() {
        const onlineDevice = await this.prisma.device.findFirst({
            where: { status: 'ONLINE' }
        });
        if (!onlineDevice) {
            throw new common_1.NotFoundException('No ONLINE biometric devices found. Please test-connect a device first by clicking the Play ▷ button on a device card.');
        }
        let zkInstance = null;
        try {
            zkInstance = await this.connectToDevice(onlineDevice.ip, onlineDevice.port);
            this.logger.log(`Connected to ${onlineDevice.name} for fingerprint retrieval`);
            const users = await zkInstance.getUsers();
            this.logger.log(`Found ${users?.data?.length || 0} users on device`);
            let fingerprints = null;
            try {
                fingerprints = await zkInstance.getFingerprints();
            }
            catch (fpErr) {
                this.logger.warn('getFingerprints not supported on this device/library version, trying alternative...');
            }
            if (fingerprints && fingerprints.data && fingerprints.data.length > 0) {
                const latest = fingerprints.data[fingerprints.data.length - 1];
                return {
                    status: 'success',
                    message: `Fingerprint retrieved from ${onlineDevice.name}`,
                    fingerData: Buffer.from(JSON.stringify(latest)).toString('base64'),
                    deviceUsed: onlineDevice.id,
                    totalTemplates: fingerprints.data.length
                };
            }
            if (users && users.data && users.data.length > 0) {
                const latestUser = users.data[users.data.length - 1];
                return {
                    status: 'success',
                    message: `Device connected. Found ${users.data.length} enrolled user(s) on ${onlineDevice.name}. Please enroll the fingerprint on the device first, then pull it.`,
                    fingerData: Buffer.from(JSON.stringify({
                        uid: latestUser.uid,
                        userId: latestUser.userId,
                        name: latestUser.name,
                        deviceId: onlineDevice.id,
                        source: 'zkteco-device',
                        timestamp: new Date().toISOString()
                    })).toString('base64'),
                    deviceUsed: onlineDevice.id,
                    enrolledUsers: users.data.length
                };
            }
            return {
                status: 'warning',
                message: `Connected to ${onlineDevice.name} but no enrolled users/fingerprints found on the device. Please enroll a fingerprint on the device first using its keypad.`,
                fingerData: null,
                deviceUsed: onlineDevice.id
            };
        }
        catch (err) {
            this.logger.error('Error during fingerprint scan:', err);
            await this.update(onlineDevice.id, { status: 'OFFLINE' });
            throw new common_1.BadRequestException(`Failed to communicate with ${onlineDevice.name} at ${onlineDevice.ip}:${onlineDevice.port}. Error: ${err.message || 'Connection lost'}`);
        }
        finally {
            if (zkInstance) {
                try {
                    await zkInstance.disconnect();
                }
                catch (_) { }
            }
        }
    }
    async getDeviceLogs(id) {
        const device = await this.findOne(id);
        let zkInstance = null;
        try {
            zkInstance = await this.connectToDevice(device.ip, device.port);
            const logs = await zkInstance.getAttendances();
            await this.update(id, { status: 'ONLINE', lastSyncTime: new Date() });
            return {
                status: 'success',
                message: `Retrieved ${logs?.data?.length || 0} attendance records from ${device.name}`,
                data: logs?.data || [],
                device
            };
        }
        catch (err) {
            await this.update(id, { status: 'OFFLINE' });
            throw new common_1.BadRequestException(`Failed to get logs from ${device.name}: ${err.message || 'Connection failed'}`);
        }
        finally {
            if (zkInstance) {
                try {
                    await zkInstance.disconnect();
                }
                catch (_) { }
            }
        }
    }
    async getDeviceUsers(id) {
        const device = await this.findOne(id);
        let zkInstance = null;
        try {
            zkInstance = await this.connectToDevice(device.ip, device.port);
            const users = await zkInstance.getUsers();
            await this.update(id, { status: 'ONLINE', lastSyncTime: new Date() });
            return {
                status: 'success',
                message: `Found ${users?.data?.length || 0} enrolled users on ${device.name}`,
                data: users?.data || [],
                device
            };
        }
        catch (err) {
            await this.update(id, { status: 'OFFLINE' });
            throw new common_1.BadRequestException(`Failed to get users from ${device.name}: ${err.message || 'Connection failed'}`);
        }
        finally {
            if (zkInstance) {
                try {
                    await zkInstance.disconnect();
                }
                catch (_) { }
            }
        }
    }
    async handleDeviceStatusCheck() {
        this.logger.debug('Running periodic device status check...');
        const devices = await this.findAll();
        for (const device of devices) {
            let zkInstance = null;
            try {
                zkInstance = new ZKLib(device.ip, device.port, 5200, 4000);
                await zkInstance.createSocket();
                if (device.status !== 'ONLINE') {
                    await this.update(device.id, { status: 'ONLINE', lastSyncTime: new Date() });
                    this.logger.log(`Device ${device.name} is now ONLINE`);
                }
            }
            catch (_) {
                if (device.status !== 'OFFLINE') {
                    await this.update(device.id, { status: 'OFFLINE' });
                    this.logger.warn(`Device ${device.name} is now OFFLINE`);
                }
            }
            finally {
                if (zkInstance) {
                    try {
                        await zkInstance.disconnect();
                    }
                    catch (_) { }
                }
            }
        }
    }
};
exports.DevicesService = DevicesService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevicesService.prototype, "handleDeviceStatusCheck", null);
exports.DevicesService = DevicesService = DevicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevicesService);
//# sourceMappingURL=devices.service.js.map