import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StudentsService } from './students.service';
import { StudentStatus } from '../../../_contracts';
import { StudentsRepository } from '../repositories/students.repository';

describe('StudentsService', () => {
  let service: StudentsService;

  const mockStudentsRepository = {
    create: jest.fn(),
    findAllByTeacherId: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: StudentsRepository,
          useValue: mockStudentsRepository,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a student for teacher', async () => {
      const teacherId = faker.string.uuid();
      const createdStudent = {
        id: faker.string.uuid(),
        teacherId,
        firstName: 'Anna',
        status: StudentStatus.ACTIVE,
      };

      mockStudentsRepository.create.mockResolvedValue(createdStudent);

      const result = await service.create(teacherId, {
        firstName: ' Anna ',
        price: 2000,
        duration: 60,
      });

      expect(result).toEqual(createdStudent);
      expect(mockStudentsRepository.create).toHaveBeenCalledWith({
        teacherId,
        firstName: 'Anna',
        lastName: null,
        phone: null,
        email: null,
        telegram: null,
        status: StudentStatus.ACTIVE,
        price: 2000,
        duration: 60,
        paymentType: 'prepaid',
        paymentThresholdLessons: 12,
        startDate: null,
        comment: null,
      });
    });
  });

  describe('getById', () => {
    it('should return student', async () => {
      const teacherId = faker.string.uuid();
      const student = { id: faker.string.uuid(), teacherId };

      mockStudentsRepository.findOne.mockResolvedValue(student);

      await expect(service.getById(teacherId, student.id)).resolves.toEqual(student);
    });

    it('should throw when student not found', async () => {
      mockStudentsRepository.findOne.mockResolvedValue(null);

      await expect(service.getById(faker.string.uuid(), faker.string.uuid())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update student and return fresh entity', async () => {
      const teacherId = faker.string.uuid();
      const studentId = faker.string.uuid();
      const updated = {
        id: studentId,
        teacherId,
        firstName: 'Maria',
        status: StudentStatus.PAUSED,
      };

      mockStudentsRepository.findOne
        .mockResolvedValueOnce({ id: studentId, teacherId })
        .mockResolvedValueOnce(updated);
      mockStudentsRepository.update.mockResolvedValue(undefined);

      const result = await service.update(teacherId, studentId, {
        firstName: ' Maria ',
        status: StudentStatus.PAUSED,
      });

      expect(result).toEqual(updated);
      expect(mockStudentsRepository.update).toHaveBeenCalledWith(studentId, teacherId, {
        firstName: 'Maria',
        status: StudentStatus.PAUSED,
      });
    });
  });
});
