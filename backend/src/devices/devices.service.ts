import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ZKLib = require('node-zklib');

@Injectable()
export class DevicesService {
    private readonly logger = new Logger(DevicesService.name);

    constructor(private prisma: PrismaService) { }

    // ─── CRUD ────────────────────────────────────────────

    async create(data: Prisma.DeviceCreateInput) {
        return this.prisma.device.create({ data });
    }

    async findAll() {
        return this.prisma.device.findMany();
    }

    async findOne(id: string) {
        const device = await this.prisma.device.findUnique({ where: { id } });
        if (!device) throw new NotFoundException('Device not found');
        return device;
    }

    async update(id: string, data: Prisma.DeviceUpdateInput) {
        return this.prisma.device.update({
            where: { id },
            data,
        }).catch(() => {
            throw new NotFoundException('Device not found');
        });
    }

    async remove(id: string) {
        return this.prisma.device.delete({ where: { id } }).catch(() => {
            throw new NotFoundException('Device not found');
        });
    }

    // ─── Real ZKTeco Device Connection ───────────────────

    /**
     * Creates a real TCP connection to the ZKTeco device
     * using node-zklib and returns a connected instance.
     */
    private async connectToDevice(ip: string, port: number): Promise<any> {
        const zkInstance = new ZKLib(ip, port, 5200, 4000);
        try {
            await zkInstance.createSocket();
            return zkInstance;
        } catch (err) {
            this.logger.error(`Failed to connect to ZKTeco device at ${ip}:${port}`, err);
            throw new BadRequestException(`Cannot connect to device at ${ip}:${port}. Make sure the device is powered on and reachable on the network.`);
        }
    }

    /**
     * Tests real TCP connection to a ZKTeco device.
     * Updates DB status to ONLINE if successful, OFFLINE if failed.
     */
    async testConnection(id: string) {
        const device = await this.findOne(id);
        let zkInstance: any = null;

        try {
            zkInstance = await this.connectToDevice(device.ip, device.port);

            // If we reach here, connection was successful
            await this.update(id, { status: 'ONLINE', lastSyncTime: new Date() });

            return {
                status: 'success',
                message: `Successfully connected to ${device.name} at ${device.ip}:${device.port}`,
                device: { ...device, status: 'ONLINE' },
            };
        } catch (err) {
            // Connection failed — mark device OFFLINE
            await this.update(id, { status: 'OFFLINE' });
            return {
                status: 'error',
                message: `Cannot reach ${device.name} at ${device.ip}:${device.port}. Device is OFFLINE or unreachable.`,
                device: { ...device, status: 'OFFLINE' },
            };
        } finally {
            if (zkInstance) {
                try { await zkInstance.disconnect(); } catch (_) { }
            }
        }
    }

    /**
     * Real fingerprint scanning.  
     * Connects to an ONLINE device, retrieves users/fingerprints,
     * and returns the latest enrolled fingerprint template.
     *
     * NOTE: node-zklib does NOT support "live enrollment mode" directly.
     * The standard ZKTeco workflow is:
     *   1. Enroll the fingerprint ON the physical device using its keypad.
     *   2. Then pull the fingerprint data from the device into the server.
     *
     * So this endpoint:
     *   - Connects to the first ONLINE device
     *   - Reads all stored fingerprint templates from the device
     *   - Returns the latest one (highest UID)
     *
     * If you want "live scan" you must first enroll the finger ON the
     * device screen, then click this button to pull it.
     */
    async scanFingerprint() {
        // 1. Find an online device
        const onlineDevice = await this.prisma.device.findFirst({
            where: { status: 'ONLINE' }
        });

        if (!onlineDevice) {
            throw new NotFoundException(
                'No ONLINE biometric devices found. Please test-connect a device first by clicking the Play ▷ button on a device card.'
            );
        }

        let zkInstance: any = null;

        try {
            // 2. Connect to the device
            zkInstance = await this.connectToDevice(onlineDevice.ip, onlineDevice.port);
            this.logger.log(`Connected to ${onlineDevice.name} for fingerprint retrieval`);

            // 3. Get all users from the device
            const users = await zkInstance.getUsers();
            this.logger.log(`Found ${users?.data?.length || 0} users on device`);

            // 4. Try to get fingerprint templates
            //    node-zklib supports getFingerprints() which reads stored templates
            let fingerprints: any = null;
            try {
                fingerprints = await zkInstance.getFingerprints();
            } catch (fpErr) {
                this.logger.warn('getFingerprints not supported on this device/library version, trying alternative...');
            }

            if (fingerprints && fingerprints.data && fingerprints.data.length > 0) {
                // Return the latest fingerprint template
                const latest = fingerprints.data[fingerprints.data.length - 1];
                return {
                    status: 'success',
                    message: `Fingerprint retrieved from ${onlineDevice.name}`,
                    fingerData: Buffer.from(JSON.stringify(latest)).toString('base64'),
                    deviceUsed: onlineDevice.id,
                    totalTemplates: fingerprints.data.length
                };
            }

            // Fallback: if direct fingerprint retrieval isn't available,
            // return user data as confirmation that device communication works
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

        } catch (err: any) {
            this.logger.error('Error during fingerprint scan:', err);
            // Mark device as offline since we couldn't communicate
            await this.update(onlineDevice.id, { status: 'OFFLINE' });
            throw new BadRequestException(
                `Failed to communicate with ${onlineDevice.name} at ${onlineDevice.ip}:${onlineDevice.port}. Error: ${err.message || 'Connection lost'}`
            );
        } finally {
            if (zkInstance) {
                try { await zkInstance.disconnect(); } catch (_) { }
            }
        }
    }

    /**
     * Get real-time attendance logs from a specific device
     */
    async getDeviceLogs(id: string) {
        const device = await this.findOne(id);
        let zkInstance: any = null;

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
        } catch (err: any) {
            await this.update(id, { status: 'OFFLINE' });
            throw new BadRequestException(
                `Failed to get logs from ${device.name}: ${err.message || 'Connection failed'}`
            );
        } finally {
            if (zkInstance) {
                try { await zkInstance.disconnect(); } catch (_) { }
            }
        }
    }

    /**
     * Get the list of enrolled users on a specific device
     */
    async getDeviceUsers(id: string) {
        const device = await this.findOne(id);
        let zkInstance: any = null;

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
        } catch (err: any) {
            await this.update(id, { status: 'OFFLINE' });
            throw new BadRequestException(
                `Failed to get users from ${device.name}: ${err.message || 'Connection failed'}`
            );
        } finally {
            if (zkInstance) {
                try { await zkInstance.disconnect(); } catch (_) { }
            }
        }
    }

    // ─── Periodic Health Check (Real TCP Ping) ───────────

    @Cron(CronExpression.EVERY_MINUTE)
    async handleDeviceStatusCheck() {
        this.logger.debug('Running periodic device status check...');
        const devices = await this.findAll();

        for (const device of devices) {
            let zkInstance: any = null;
            try {
                zkInstance = new ZKLib(device.ip, device.port, 5200, 4000);
                await zkInstance.createSocket();
                // Connection succeeded
                if (device.status !== 'ONLINE') {
                    await this.update(device.id, { status: 'ONLINE', lastSyncTime: new Date() });
                    this.logger.log(`Device ${device.name} is now ONLINE`);
                }
            } catch (_) {
                // Connection failed
                if (device.status !== 'OFFLINE') {
                    await this.update(device.id, { status: 'OFFLINE' });
                    this.logger.warn(`Device ${device.name} is now OFFLINE`);
                }
            } finally {
                if (zkInstance) {
                    try { await zkInstance.disconnect(); } catch (_) { }
                }
            }
        }
    }
}
