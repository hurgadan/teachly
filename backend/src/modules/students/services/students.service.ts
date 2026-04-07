import { Injectable, NotFoundException } from '@nestjs/common';

import { StudentStatus } from '../../../_contracts';
import { StudentEntity } from '../dao/student.entity';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { StudentsRepository } from '../repositories/students.repository';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  public async create(teacherId: string, data: CreateStudentDto): Promise<StudentEntity> {
    return this.studentsRepository.create({
      teacherId,
      firstName: data.firstName.trim(),
      lastName: normalizeNullableText(data.lastName),
      phone: normalizeNullableText(data.phone),
      email: normalizeNullableText(data.email),
      telegram: normalizeNullableText(data.telegram),
      status: StudentStatus.ACTIVE,
      price: data.price,
      duration: data.duration,
      startDate: data.startDate ?? null,
      comment: normalizeNullableText(data.comment),
    });
  }

  public async findAll(teacherId: string, search?: string): Promise<StudentEntity[]> {
    return this.studentsRepository.findAllByTeacherId(teacherId, search?.trim() || undefined);
  }

  public async getById(teacherId: string, id: string): Promise<StudentEntity> {
    const student = await this.studentsRepository.findOne({ id, teacherId });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  public async update(
    teacherId: string,
    id: string,
    data: UpdateStudentDto,
  ): Promise<StudentEntity> {
    await this.getById(teacherId, id);

    await this.studentsRepository.update(id, teacherId, {
      ...(data.firstName !== undefined ? { firstName: data.firstName.trim() } : {}),
      ...(data.lastName !== undefined ? { lastName: normalizeNullableText(data.lastName) } : {}),
      ...(data.phone !== undefined ? { phone: normalizeNullableText(data.phone) } : {}),
      ...(data.email !== undefined ? { email: normalizeNullableText(data.email) } : {}),
      ...(data.telegram !== undefined ? { telegram: normalizeNullableText(data.telegram) } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
      ...(data.comment !== undefined ? { comment: normalizeNullableText(data.comment) } : {}),
    });

    return this.getById(teacherId, id);
  }

  public async getByIds(teacherId: string, ids: string[]): Promise<StudentEntity[]> {
    if (!ids.length) {
      return [];
    }

    return this.studentsRepository.findMany({
      ids,
      teacherId,
    });
  }
}

function normalizeNullableText(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
