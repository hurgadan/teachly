import { Server } from 'node:http';

import { HttpStatus, INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { Repository } from 'typeorm';

import { userFactory } from '../../../_common/utils/factories/users.factory';
import { clearTables } from '../../../_common/utils/tests/clear-tables';
import { createTestingAppAndHttpServer } from '../../../_common/utils/tests/create-testing-app-and-http-server';
import { getRepository } from '../../../_common/utils/tests/get-repository';
import { getTestingModuleImports } from '../../../_common/utils/tests/get-testing-module-imports';
import { StudentStatus } from '../../../_contracts';
import { AuthModule } from '../../auth/auth.module';
import { StudentEntity } from '../../students/dao/student.entity';
import { StudentsModule } from '../../students/students.module';
import { GroupMemberEntity } from '../dao/group-member.entity';
import { GroupEntity } from '../dao/group.entity';
import { GroupsModule } from '../groups.module';

describe('groups.controller.e2e.spec.ts', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  let httpServer: Server;
  let studentsRepository: Repository<StudentEntity>;
  let jwtService: JwtService;

  const url = '/groups';

  beforeAll(async () => {
    process.env.JWT_SECRET ??= 'test-secret';
    process.env.ACCESS_TOKEN_EXPIRES ??= '1h';

    testingModule = await Test.createTestingModule({
      imports: [
        ...getTestingModuleImports([StudentEntity, GroupEntity, GroupMemberEntity]),
        AuthModule,
        StudentsModule,
        GroupsModule,
      ],
    }).compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(testingModule));
    studentsRepository = getRepository<StudentEntity>(testingModule, StudentEntity);
    jwtService = testingModule.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(testingModule);
  });

  it('should create group with members and return it', async () => {
    const teacher = await userFactory(testingModule);
    const token = jwtService.sign({ id: teacher.id, email: teacher.email });
    const student = await studentsRepository.save({
      teacherId: teacher.id,
      firstName: 'Anna',
      status: StudentStatus.ACTIVE,
      price: 2000,
      duration: 60,
    });

    const createResult = await request(httpServer)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Morning Group',
        duration: 90,
        studentIds: [student.id],
      })
      .expect(HttpStatus.CREATED);

    expect(createResult.body.name).toBe('Morning Group');
    expect(createResult.body.members).toHaveLength(1);
    expect(createResult.body.members[0].studentId).toBe(student.id);
  });

  it('should reject foreign student in group payload', async () => {
    const teacher = await userFactory(testingModule);
    const otherTeacher = await userFactory(testingModule);
    const token = jwtService.sign({ id: teacher.id, email: teacher.email });
    const foreignStudent = await studentsRepository.save({
      teacherId: otherTeacher.id,
      firstName: 'Foreign',
      status: StudentStatus.ACTIVE,
      price: 2000,
      duration: 60,
    });

    await request(httpServer)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Morning Group',
        duration: 90,
        studentIds: [foreignStudent.id],
      })
      .expect(HttpStatus.BAD_REQUEST);
  });
});
