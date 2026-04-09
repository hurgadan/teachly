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
import { LessonStatus, StudentStatus } from '../../../_contracts';
import { AuthModule } from '../../auth/auth.module';
import { CalendarModule } from '../../calendar/calendar.module';
import { LessonEntity } from '../../calendar/dao/lesson.entity';
import { RecurringLessonEntity } from '../../calendar/dao/recurring-lesson.entity';
import { GroupMemberEntity } from '../../groups/dao/group-member.entity';
import { GroupEntity } from '../../groups/dao/group.entity';
import { GroupsModule } from '../../groups/groups.module';
import { StudentEntity } from '../../students/dao/student.entity';
import { StudentsModule } from '../../students/students.module';
import { UsersModule } from '../../users/users.module';
import { PaymentEntity } from '../dao/payment.entity';
import { PaymentsModule } from '../payments.module';

describe('payments.controller.e2e.spec.ts', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  let httpServer: Server;
  let jwtService: JwtService;
  let studentsRepository: Repository<StudentEntity>;
  let paymentsRepository: Repository<PaymentEntity>;
  let lessonsRepository: Repository<LessonEntity>;

  beforeAll(async () => {
    process.env.JWT_SECRET ??= 'test-secret';
    process.env.ACCESS_TOKEN_EXPIRES ??= '1h';

    testingModule = await Test.createTestingModule({
      imports: [
        ...getTestingModuleImports([
          StudentEntity,
          GroupEntity,
          GroupMemberEntity,
          LessonEntity,
          RecurringLessonEntity,
          PaymentEntity,
        ]),
        AuthModule,
        StudentsModule,
        GroupsModule,
        UsersModule,
        CalendarModule,
        PaymentsModule,
      ],
    }).compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(testingModule));
    jwtService = testingModule.get(JwtService);
    studentsRepository = getRepository<StudentEntity>(testingModule, StudentEntity);
    paymentsRepository = getRepository<PaymentEntity>(testingModule, PaymentEntity);
    lessonsRepository = getRepository<LessonEntity>(testingModule, LessonEntity);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(testingModule);
  });

  it('should create payment for student', async () => {
    const teacher = await userFactory(testingModule);
    const token = jwtService.sign({ id: teacher.id, email: teacher.email });
    const student = await studentsRepository.save({
      teacherId: teacher.id,
      firstName: 'Anna',
      status: StudentStatus.ACTIVE,
      price: 2000,
      duration: 60,
    });

    const result = await request(httpServer)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: student.id, amount: 2000, comment: 'April' })
      .expect(HttpStatus.CREATED);

    expect(result.body).toEqual(
      expect.objectContaining({
        studentId: student.id,
        amount: 2000,
        comment: 'April',
      }),
    );
  });

  it('should return paginated payments for student', async () => {
    const teacher = await userFactory(testingModule);
    const token = jwtService.sign({ id: teacher.id, email: teacher.email });
    const student = await studentsRepository.save({
      teacherId: teacher.id,
      firstName: 'Mila',
      status: StudentStatus.ACTIVE,
      price: 1500,
      duration: 60,
    });

    await paymentsRepository.save([
      { teacherId: teacher.id, studentId: student.id, groupId: null, amount: 1500, comment: null },
      {
        teacherId: teacher.id,
        studentId: student.id,
        groupId: null,
        amount: 3000,
        comment: 'March',
      },
    ]);

    const result = await request(httpServer)
      .get('/payments')
      .query({ studentId: student.id, page: 1, limit: 10 })
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(result.body).toEqual(
      expect.objectContaining({
        total: 2,
        page: 1,
        limit: 10,
        items: expect.arrayContaining([
          expect.objectContaining({ amount: 1500 }),
          expect.objectContaining({ amount: 3000 }),
        ]),
      }),
    );
  });

  it('should reject payment without target', async () => {
    const teacher = await userFactory(testingModule);
    const token = jwtService.sign({ id: teacher.id, email: teacher.email });

    await request(httpServer)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1000 })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should return student balance', async () => {
    const teacher = await userFactory(testingModule);
    const token = jwtService.sign({ id: teacher.id, email: teacher.email });
    const student = await studentsRepository.save({
      teacherId: teacher.id,
      firstName: 'Vera',
      status: StudentStatus.ACTIVE,
      price: 2000,
      duration: 60,
    });

    // 2 завершённых урока × 2000 = 4000 charged
    await lessonsRepository.save([
      {
        teacherId: teacher.id,
        studentId: student.id,
        groupId: null,
        recurringLessonId: null,
        startAt: new Date('2026-04-01T06:00:00.000Z'),
        duration: 60,
        status: LessonStatus.COMPLETED,
      },
      {
        teacherId: teacher.id,
        studentId: student.id,
        groupId: null,
        recurringLessonId: null,
        startAt: new Date('2026-04-08T06:00:00.000Z'),
        duration: 60,
        status: LessonStatus.COMPLETED,
      },
    ]);

    // 5000 paid
    await paymentsRepository.save({
      teacherId: teacher.id,
      studentId: student.id,
      groupId: null,
      amount: 5000,
      comment: null,
    });

    const result = await request(httpServer)
      .get(`/students/${student.id}/balance`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(result.body).toEqual({
      studentId: student.id,
      totalPaid: 5000,
      totalCharged: 4000,
      balance: 1000,
    });
  });
});
