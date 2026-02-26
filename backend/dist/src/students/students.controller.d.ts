import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    getAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        firstName: string;
        lastName: string | null;
        fatherName: string | null;
        cnic: string | null;
        email: string | null;
        phone: string | null;
        fingerData: string | null;
    }[]>;
    getOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        firstName: string;
        lastName: string | null;
        fatherName: string | null;
        cnic: string | null;
        email: string | null;
        phone: string | null;
        fingerData: string | null;
    }>;
    create(body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        firstName: string;
        lastName: string | null;
        fatherName: string | null;
        cnic: string | null;
        email: string | null;
        phone: string | null;
        fingerData: string | null;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        firstName: string;
        lastName: string | null;
        fatherName: string | null;
        cnic: string | null;
        email: string | null;
        phone: string | null;
        fingerData: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        firstName: string;
        lastName: string | null;
        fatherName: string | null;
        cnic: string | null;
        email: string | null;
        phone: string | null;
        fingerData: string | null;
    }>;
}
