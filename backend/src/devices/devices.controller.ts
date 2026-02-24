import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { Prisma } from '@prisma/client';

@Controller('devices')
export class DevicesController {
    constructor(private readonly devicesService: DevicesService) { }

    @Post()
    create(@Body() createDeviceDto: Prisma.DeviceCreateInput) {
        return this.devicesService.create(createDeviceDto);
    }

    @Get()
    findAll() {
        return this.devicesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.devicesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDeviceDto: Prisma.DeviceUpdateInput) {
        return this.devicesService.update(id, updateDeviceDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.devicesService.remove(id);
    }

    @Get(':id/test-connection')
    testConnection(@Param('id') id: string) {
        return this.devicesService.testConnection(id);
    }

    @Post('scan-fingerprint')
    scanFingerprint() {
        return this.devicesService.scanFingerprint();
    }

    @Get(':id/logs')
    getDeviceLogs(@Param('id') id: string) {
        return this.devicesService.getDeviceLogs(id);
    }

    @Get(':id/users')
    getDeviceUsers(@Param('id') id: string) {
        return this.devicesService.getDeviceUsers(id);
    }
}
