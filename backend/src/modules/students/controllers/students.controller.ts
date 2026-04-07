import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequestExtended } from '../../../_common/types';
import { transformToDto } from '../../../_common/utils/transform-to-dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateStudentDto } from '../dto/create-student.dto';
import { StudentDto } from '../dto/student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { StudentsService } from '../services/students.service';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create student' })
  @ApiOkResponse({ type: StudentDto })
  public async createStudent(
    @Request() req: RequestExtended,
    @Body() data: CreateStudentDto,
  ): Promise<StudentDto> {
    const student = await this.studentsService.create(req.user!.id, data);
    return transformToDto(StudentDto, student);
  }

  @Get()
  @ApiOperation({ summary: 'Get students' })
  @ApiOkResponse({ type: [StudentDto] })
  public async getStudents(
    @Request() req: RequestExtended,
    @Query('search') search?: string,
  ): Promise<StudentDto[]> {
    const students = await this.studentsService.findAll(req.user!.id, search);
    return students.map((student) => transformToDto(StudentDto, student));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by id' })
  @ApiOkResponse({ type: StudentDto })
  public async getStudent(
    @Request() req: RequestExtended,
    @Param('id') id: string,
  ): Promise<StudentDto> {
    const student = await this.studentsService.getById(req.user!.id, id);
    return transformToDto(StudentDto, student);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update student' })
  @ApiOkResponse({ type: StudentDto })
  public async updateStudent(
    @Request() req: RequestExtended,
    @Param('id') id: string,
    @Body() data: UpdateStudentDto,
  ): Promise<StudentDto> {
    const student = await this.studentsService.update(req.user!.id, id, data);
    return transformToDto(StudentDto, student);
  }
}
