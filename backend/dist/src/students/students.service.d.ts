import { PrismaService } from '../prisma/prisma.service';
export declare class StudentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        cnic: string | null;
        firstName: string;
        lastName: string | null;
        fatherName: string | null;
        email: string | null;
        phone: string | null;
        fingerData: string | null;
    }[]>;
    getOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        cnic: string | null;
        firstName: string;
        lastName: string | null;
        fatherName: string | null;
        email: string | null;
        phone: string | null;
        fingerData: string | null;
    }>;
    create(data: {
        studentId: string;
        firstName: string;
        lastName?: string;
        fatherName?: string;
        cnic?: string;
        email?: string;
        phone?: string;
        fingerData?: string;
        className?: string;
        section?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        cnic: string | null;
        firstName: string;
        lastName: string | null;
        fatherName: string | null;
        email: string | null;
        phone: string | null;
        fingerData: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        cnic: string | null;
        firstName: string;
        lastName: string | null;
        fatherName: string | null;
        email: string | null;
        phone: string | null;
        fingerData: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        cnic: string | null;
        firstName: string;
        lastName: string | null;
        fatherName: string | null;
        email: string | null;
        phone: string | null;
        fingerData: string | null;
    }>;
}
