import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GroupsService } from './groups.service';
import { StudentsService } from '../../students/services/students.service';
import { GroupMembersRepository } from '../repositories/group-members.repository';
import { GroupsRepository } from '../repositories/groups.repository';

describe('GroupsService', () => {
  let service: GroupsService;

  const mockGroupsRepository = {
    create: jest.fn(),
    findAllByTeacherId: jest.fn(),
    findOneByIdAndTeacherId: jest.fn(),
    update: jest.fn(),
  };

  const mockGroupMembersRepository = {
    replaceForGroup: jest.fn(),
  };

  const mockStudentsService = {
    getByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: GroupsRepository,
          useValue: mockGroupsRepository,
        },
        {
          provide: GroupMembersRepository,
          useValue: mockGroupMembersRepository,
        },
        {
          provide: StudentsService,
          useValue: mockStudentsService,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create group and replace members', async () => {
      const teacherId = faker.string.uuid();
      const groupId = faker.string.uuid();
      const studentIds = [faker.string.uuid(), faker.string.uuid()];
      const createdGroup = { id: groupId, teacherId };
      const loadedGroup = { id: groupId, teacherId, members: [] };

      mockStudentsService.getByIds.mockResolvedValue(studentIds.map((id) => ({ id })));
      mockGroupsRepository.create.mockResolvedValue(createdGroup);
      mockGroupMembersRepository.replaceForGroup.mockResolvedValue(undefined);
      mockGroupsRepository.findOneByIdAndTeacherId.mockResolvedValue(loadedGroup);

      const result = await service.create(teacherId, {
        name: ' Group A ',
        duration: 60,
        studentIds,
      });

      expect(result).toEqual(loadedGroup);
      expect(mockGroupsRepository.create).toHaveBeenCalledWith({
        teacherId,
        name: 'Group A',
        duration: 60,
      });
      expect(mockGroupMembersRepository.replaceForGroup).toHaveBeenCalledWith(groupId, studentIds);
    });

    it('should throw when teacher tries to use чужих students', async () => {
      mockStudentsService.getByIds.mockResolvedValue([{ id: faker.string.uuid() }]);

      await expect(
        service.create(faker.string.uuid(), {
          name: 'A',
          duration: 60,
          studentIds: [faker.string.uuid(), faker.string.uuid()],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getById', () => {
    it('should throw when group not found', async () => {
      mockGroupsRepository.findOneByIdAndTeacherId.mockResolvedValue(null);

      await expect(service.getById(faker.string.uuid(), faker.string.uuid())).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
