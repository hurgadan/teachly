import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequestExtended } from '../../../_common/types';
import { transformToDto } from '../../../_common/utils/transform-to-dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AvailableSlotDto } from '../dto/available-slot.dto';
import { AvailableSlotsQueryDto } from '../dto/available-slots-query.dto';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { CreateRecurringLessonDto } from '../dto/create-recurring-lesson.dto';
import { LessonDto } from '../dto/lesson.dto';
import { LessonsQueryDto } from '../dto/lessons-query.dto';
import { PaginatedLessonsDto } from '../dto/paginated-lessons.dto';
import { UpdateLessonStatusDto } from '../dto/update-lesson-status.dto';
import { CalendarService } from '../services/calendar.service';

@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('week')
  @ApiOperation({ summary: 'Get calendar week lessons' })
  @ApiOkResponse({ type: [LessonDto] })
  public async getWeek(
    @Request() req: RequestExtended,
    @Query('startDate') startDate?: string,
  ): Promise<LessonDto[]> {
    const lessons = await this.calendarService.getWeek(req.user!.id, startDate);
    return lessons.map((lesson) => transformToDto(LessonDto, lesson));
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Get available slots for the week' })
  @ApiOkResponse({ type: [AvailableSlotDto] })
  public async getAvailableSlots(
    @Request() req: RequestExtended,
    @Query() query: AvailableSlotsQueryDto,
  ): Promise<AvailableSlotDto[]> {
    const slots = await this.calendarService.getAvailableSlots(
      req.user!.id,
      query.startDate,
      query.duration,
    );

    return slots.map((slot) => transformToDto(AvailableSlotDto, slot));
  }

  @Get('lessons')
  @ApiOperation({ summary: 'Get lesson history (paginated)' })
  @ApiOkResponse({ type: PaginatedLessonsDto })
  public async getLessons(
    @Request() req: RequestExtended,
    @Query() query: LessonsQueryDto,
  ): Promise<PaginatedLessonsDto> {
    const result = await this.calendarService.getLessons(
      req.user!.id,
      { studentId: query.studentId, groupId: query.groupId },
      query.page,
      query.limit,
    );

    return transformToDto(PaginatedLessonsDto, {
      ...result,
      items: result.items.map((item) => transformToDto(LessonDto, item)),
    });
  }

  @Post('recurring-lessons')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create recurring lesson' })
  @ApiOkResponse({ type: [LessonDto] })
  public async createRecurringLesson(
    @Request() req: RequestExtended,
    @Body() data: CreateRecurringLessonDto,
  ): Promise<LessonDto[]> {
    const lessons = await this.calendarService.createRecurringLesson(req.user!.id, data);
    return lessons.map((lesson) => transformToDto(LessonDto, lesson));
  }

  @Post('lessons')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create lesson' })
  @ApiOkResponse({ type: LessonDto })
  public async createLesson(
    @Request() req: RequestExtended,
    @Body() data: CreateLessonDto,
  ): Promise<LessonDto> {
    const lesson = await this.calendarService.createLesson(req.user!.id, data);
    return transformToDto(LessonDto, lesson);
  }

  @Patch('lessons/:id/status')
  @ApiOperation({ summary: 'Update lesson status' })
  @ApiOkResponse({ type: LessonDto })
  public async updateLessonStatus(
    @Request() req: RequestExtended,
    @Param('id') id: string,
    @Body() data: UpdateLessonStatusDto,
  ): Promise<LessonDto> {
    const lesson = await this.calendarService.updateLessonStatus(req.user!.id, id, data);
    return transformToDto(LessonDto, lesson);
  }
}
