import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) { }

    async getAll() {
        return this.prisma.student.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async getOne(id: string) {
        const student = await this.prisma.student.findUnique({ where: { id } });
        if (!student) throw new NotFoundException('Student not found');
        return student;
    }

    async create(data: { studentId: string, firstName: string, lastName?: string, fatherName?: string, cnic?: string, email?: string, phone?: string, fingerData?: string }) {
        // Upsert or create, assuming simple create here
        return this.prisma.student.create({
            data
        });
    }

    async update(id: string, data: any) {
        return this.prisma.student.update({
            where: { id },
            data
        });
    }

    async remove(id: string) {
        return this.prisma.student.delete({
            where: { id }
        });
    }
}
