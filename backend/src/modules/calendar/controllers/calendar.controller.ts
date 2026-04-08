import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
}
