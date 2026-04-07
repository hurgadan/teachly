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
import { LessonStatus } from '../../../_contracts/calendar';
import { AuthModule } from '../../auth/auth.module';
import { GroupMemberEntity } from '../../groups/dao/group-member.entity';
import { GroupEntity } from '../../groups/dao/group.entity';
import { GroupsModule } from '../../groups/groups.module';
import { StudentEntity } from '../../students/dao/student.entity';
import { StudentsModule } from '../../students/students.module';
import { UsersService } from '../../users/services/users.service';
import { CalendarModule } from '../calendar.module';
import { LessonEntity } from '../dao/lesson.entity';
import { RecurringLessonEntity } from '../dao/recurring-lesson.entity';

describe('calendar.controller.e2e.spec.ts', () => {
  let app: INestApplication;
  let testingModule: TestingModule;
  let httpServer: Server;
  let jwtService: JwtService;
  let usersService: UsersService;
  let studentsRepository: Repository<StudentEntity>;
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
        ]),
        AuthModule,
        StudentsModule,
        GroupsModule,
        CalendarModule,
      ],
    }).compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(testingModule));
    jwtService = testingModule.get(JwtService);
    usersService = testingModule.get(UsersService);
    studentsRepository = getRepository<StudentEntity>(testingModule, StudentEntity);
    lessonsRepository = getRepository<LessonEntity>(testingModule, LessonEntity);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(testingModule);
  });

  it('should return available slots for teacher week', async () => {
    const teacher = await userFactory(testingModule);
    const token = jwtService.sign({ id: teacher.id, email: teacher.email });

    await usersService.updateWorkSchedule(teacher.id, {
      schedules: [
        {
          dayOfWeek: 0,
          isWorkday: true,
          intervals: [{ startTime: '09:00', endTime: '12:00' }],
        },
      ],
    });

    await lessonsRepository.save({
      teacherId: teacher.id,
      studentId: null,
      groupId: null,
      recurringLessonId: null,
      date: '2026-04-06',
      startTime: '10:00',
      endTime: '11:00',
      duration: 60,
      status: LessonStatus.SCHEDULED,
    });

    const result = await request(httpServer)
      .get('/calendar/available-slots')
      .query({ startDate: '2026-04-06', duration: 60 })
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(result.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ date: '2026-04-06', startTime: '09:00', endTime: '10:00' }),
        expect.objectContaining({ date: '2026-04-06', startTime: '11:00', endTime: '12:00' }),
      ]),
    );
  });

  it('should create recurring schedule from student card and show it in calendar week', async () => {
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
      .post('/calendar/recurring-lessons')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId: student.id,
        duration: 60,
        slots: [{ date: '2026-04-06', dayOfWeek: 0, startTime: '09:00' }],
      })
      .expect(HttpStatus.CREATED);

    expect(createResult.body).toHaveLength(1);
    expect(createResult.body[0]).toEqual(
      expect.objectContaining({
        type: 'student',
        entityId: student.id,
        date: '2026-04-06',
        startTime: '09:00',
        recurring: true,
      }),
    );

    const weekResult = await request(httpServer)
      .get('/calendar/week')
      .query({ startDate: '2026-04-06' })
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(weekResult.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entityId: student.id,
          type: 'student',
          date: '2026-04-06',
        }),
      ]),
    );
  });

  it('should create one-time lesson', async () => {
    const teacher = await userFactory(testingModule);
    const token = jwtService.sign({ id: teacher.id, email: teacher.email });
    const student = await studentsRepository.save({
      teacherId: teacher.id,
      firstName: 'Mila',
      status: StudentStatus.ACTIVE,
      price: 1800,
      duration: 60,
    });

    await usersService.updateWorkSchedule(teacher.id, {
      schedules: [
        {
          dayOfWeek: 0,
          isWorkday: true,
          intervals: [{ startTime: '09:00', endTime: '12:00' }],
        },
      ],
    });

    const result = await request(httpServer)
      .post('/calendar/lessons')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId: student.id,
        date: '2026-04-06',
        startTime: '09:00',
        duration: 60,
      })
      .expect(HttpStatus.CREATED);

    expect(result.body).toEqual(
      expect.objectContaining({
        entityId: student.id,
        type: 'student',
        date: '2026-04-06',
        startTime: '09:00',
        recurring: false,
      }),
    );
  });
});
