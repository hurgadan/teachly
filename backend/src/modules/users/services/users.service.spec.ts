import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';
import { Language } from '../../../_contracts';
import { UserEntity } from '../dao/user.entity';
import { UsersRepository } from '../repositories/users.repository';
import { WorkScheduleRepository } from '../repositories/work-schedule.repository';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneWithSchedules: jest.fn(),
    update: jest.fn(),
  };

  const mockWorkScheduleRepository = {
    findByTeacherId: jest.fn(),
    upsertMany: jest.fn(),
  };

  const mockEventEmitter = {
    emitAsync: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: WorkScheduleRepository,
          useValue: mockWorkScheduleRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user when found', async () => {
      const email = faker.internet.email();

      const mockUser = {
        id: faker.string.uuid(),
        email,
        passwordHash: faker.internet.password(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(email);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        email,
      });
      expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return null when user is not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const email = faker.internet.email();

      const result = await service.findOneByEmail(email);

      expect(result).toBeNull();
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        email,
      });
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const email = faker.internet.email();

      const createUserDto = {
        email,
        password: faker.internet.password(),
        timezone: 'Europe/Moscow',
      };

      const mockCreatedUser = {
        id: faker.string.uuid(),
        email,
        passwordHash: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(mockUsersRepository.create).toHaveBeenCalledTimes(1);

      const createCall = mockUsersRepository.create.mock.calls[0][0];
      expect(createCall.email).toBe(createUserDto.email);
      expect(createCall.passwordHash).toBeDefined();
      expect(createCall.passwordHash).not.toBe(createUserDto.password);

      // hash starts '$2[aby]'
      expect(createCall.passwordHash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('getProfile', () => {
    it('should return user with work schedules', async () => {
      const mockUser = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        language: Language.RU,
        bufferMinutesAfterLesson: 15,
        workSchedules: [],
      };

      mockUsersRepository.findOneWithSchedules.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOneWithSchedules).toHaveBeenCalledWith({
        id: mockUser.id,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOneWithSchedules.mockResolvedValue(null);

      await expect(service.getProfile(faker.string.uuid())).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields and return updated user', async () => {
      const userId = faker.string.uuid();
      const mockUser = {
        id: userId,
        email: faker.internet.email(),
        passwordHash: faker.string.sample(64),
        language: Language.RU,
        timezone: 'Europe/Moscow',
        bufferMinutesAfterLesson: 0,
        workSchedules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as UserEntity;

      const updatedUser = {
        ...mockUser,
        language: Language.EN,
        bufferMinutesAfterLesson: 30,
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockUsersRepository.update.mockResolvedValue(undefined);
      mockUsersRepository.findOneWithSchedules.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, {
        language: Language.EN,
        bufferMinutesAfterLesson: 30,
      });

      expect(result.language).toBe(Language.EN);
      expect(result.bufferMinutesAfterLesson).toBe(30);
      expect(mockUsersRepository.update).toHaveBeenCalledWith(userId, {
        language: Language.EN,
        bufferMinutesAfterLesson: 30,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile(faker.string.uuid(), {
          language: Language.EN,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWorkSchedule', () => {
    it('should return schedules for teacher', async () => {
      const userId = faker.string.uuid();
      const mockSchedules = [
        { id: faker.string.uuid(), dayOfWeek: 0, isWorkday: true, intervals: [] },
        { id: faker.string.uuid(), dayOfWeek: 1, isWorkday: false, intervals: [] },
      ];

      mockWorkScheduleRepository.findByTeacherId.mockResolvedValue(mockSchedules);

      const result = await service.getWorkSchedule(userId);

      expect(result).toEqual(mockSchedules);
      expect(mockWorkScheduleRepository.findByTeacherId).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateWorkSchedule', () => {
    it('should upsert schedules and return updated list', async () => {
      const userId = faker.string.uuid();
      const input = {
        schedules: [
          {
            dayOfWeek: 0,
            isWorkday: true,
            intervals: [{ startTime: '09:00', endTime: '18:00' }],
          },
          {
            dayOfWeek: 1,
            isWorkday: false,
            intervals: [],
          },
        ],
      };

      const mockUser = { id: userId } as UserEntity;
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockWorkScheduleRepository.upsertMany.mockResolvedValue([]);

      const savedSchedules = input.schedules.map((s) => ({
        id: faker.string.uuid(),
        teacherId: userId,
        ...s,
      }));
      mockWorkScheduleRepository.findByTeacherId.mockResolvedValue(savedSchedules);

      const result = await service.updateWorkSchedule(userId, input);

      expect(result).toEqual(savedSchedules);
      expect(mockWorkScheduleRepository.upsertMany).toHaveBeenCalledWith(
        userId,
        input.schedules.map((s) => ({ teacherId: userId, ...s })),
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateWorkSchedule(faker.string.uuid(), { schedules: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
