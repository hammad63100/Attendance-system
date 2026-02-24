import { DevicesService } from './devices.service';
import { Prisma } from '@prisma/client';
export declare class DevicesController {
    private readonly devicesService;
    constructor(devicesService: DevicesService);
    create(createDeviceDto: Prisma.DeviceCreateInput): Promise<{
        id: string;
        name: string;
        ip: string;
        port: number;
        status: string;
        lastSyncTime: Date | null;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        ip: string;
        port: number;
        status: string;
        lastSyncTime: Date | null;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        ip: string;
        port: number;
        status: string;
        lastSyncTime: Date | null;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
    }>;
    update(id: string, updateDeviceDto: Prisma.DeviceUpdateInput): Promise<{
        id: string;
        name: string;
        ip: string;
        port: number;
        status: string;
        lastSyncTime: Date | null;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        ip: string;
        port: number;
        status: string;
        lastSyncTime: Date | null;
        timezone: string;
        createdAt: Date;
        updatedAt: Date;
        campusId: string | null;
    }>;
    testConnection(id: string): Promise<{
        status: string;
        message: string;
        device: {
            status: string;
            id: string;
            name: string;
            ip: string;
            port: number;
            lastSyncTime: Date | null;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string | null;
        };
    }>;
    scanFingerprint(): Promise<{
        status: string;
        message: string;
        fingerData: string;
        deviceUsed: string;
        totalTemplates: any;
        enrolledUsers?: undefined;
    } | {
        status: string;
        message: string;
        fingerData: string;
        deviceUsed: string;
        enrolledUsers: any;
        totalTemplates?: undefined;
    } | {
        status: string;
        message: string;
        fingerData: null;
        deviceUsed: string;
        totalTemplates?: undefined;
        enrolledUsers?: undefined;
    }>;
    getDeviceLogs(id: string): Promise<{
        status: string;
        message: string;
        data: any;
        device: {
            id: string;
            name: string;
            ip: string;
            port: number;
            status: string;
            lastSyncTime: Date | null;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string | null;
        };
    }>;
    getDeviceUsers(id: string): Promise<{
        status: string;
        message: string;
        data: any;
        device: {
            id: string;
            name: string;
            ip: string;
            port: number;
            status: string;
            lastSyncTime: Date | null;
            timezone: string;
            createdAt: Date;
            updatedAt: Date;
            campusId: string | null;
        };
    }>;
}
