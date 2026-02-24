import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Get()
    getAll() {
        return this.studentsService.getAll();
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.studentsService.getOne(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.studentsService.create(body);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.studentsService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.studentsService.remove(id);
    }
}
