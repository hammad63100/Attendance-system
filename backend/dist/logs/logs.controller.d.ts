import { LogsService } from './logs.service';
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    uploadLogs(deviceId: string, body: any): Promise<{
        message: string;
    }>;
    webhookPush(deviceId: string, payload: any): Promise<{
        message: string;
    }>;
}
