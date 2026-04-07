import { Server } from 'node:http';

import { faker } from '@faker-js/faker';
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
import { GroupMemberEntity } from '../../groups/dao/group-member.entity';
import { GroupEntity } from '../../groups/dao/group.entity';
import { StudentEntity } from '../dao/student.entity';
import { StudentsModule } from '../students.module';

describe('students.controller.e2e.spec.ts', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  let httpServer: Server;
  let studentsRepository: Repository<StudentEntity>;
  let jwtService: JwtService;

  const url = '/students';

  beforeAll(async () => {
    process.env.JWT_SECRET ??= 'test-secret';
    process.env.ACCESS_TOKEN_EXPIRES ??= '1h';

    testingModule = await Test.createTestingModule({
      imports: [
        ...getTestingModuleImports([StudentEntity, GroupEntity, GroupMemberEntity]),
        AuthModule,
        StudentsModule,
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

  it('should create and list teacher students', async () => {
    const teacher = await userFactory(testingModule);
    const token = jwtService.sign({ id: teacher.id, email: teacher.email });

    const createResult = await request(httpServer)
      .post(url)
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Anna',
        price: 2000,
        duration: 60,
      })
      .expect(HttpStatus.CREATED);

    expect(createResult.body.firstName).toBe('Anna');
    expect(createResult.body.status).toBe('active');

    const listResult = await request(httpServer)
      .get(url)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(listResult.body).toHaveLength(1);
    expect(listResult.body[0].firstName).toBe('Anna');

    const students = await studentsRepository.find({
      where: { teacherId: teacher.id },
    });
    expect(students).toHaveLength(1);
  });

  it('should not return another teacher student', async () => {
    const teacher = await userFactory(testingModule);
    const otherTeacher = await userFactory(testingModule);
    const token = jwtService.sign({ id: teacher.id, email: teacher.email });

    const otherStudent = await studentsRepository.save({
      teacherId: otherTeacher.id,
      firstName: faker.person.firstName(),
      status: StudentStatus.ACTIVE,
      price: 1800,
      duration: 60,
    });

    await request(httpServer)
      .get(`${url}/${otherStudent.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
