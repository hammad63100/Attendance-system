import { Controller, Post, Body, Param } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @Post('upload/:deviceId')
    uploadLogs(@Param('deviceId') deviceId: string, @Body() body: any) {
        // Expected body: { logs: [...] } or just an array
        return this.logsService.handleManualUpload(deviceId, body?.logs || body);
    }

    @Post('webhook/:deviceId')
    webhookPush(@Param('deviceId') deviceId: string, @Body() payload: any) {
        return this.logsService.handleWebhook(deviceId, payload);
    }
}
