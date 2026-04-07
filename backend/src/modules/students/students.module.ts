import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StudentsController } from './controllers/students.controller';
import { StudentEntity } from './dao/student.entity';
import { StudentsRepository } from './repositories/students.repository';
import { StudentsService } from './services/students.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity])],
  controllers: [StudentsController],
  providers: [StudentsRepository, StudentsService],
  exports: [StudentsRepository, StudentsService, TypeOrmModule],
})
export class StudentsModule {}
