import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { PrismaModule } from './prisma/prisma.module';
import { LogsModule } from './logs/logs.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [DevicesModule, PrismaModule, ScheduleModule.forRoot(), LogsModule, AttendanceModule, AdminModule, AuthModule, StudentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
