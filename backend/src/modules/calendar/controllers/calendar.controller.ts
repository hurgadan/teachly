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
import { CalendarLessonDto } from '../dto/calendar-lesson.dto';
import { CreateOneTimeLessonDto } from '../dto/create-one-time-lesson.dto';
import { CreateRecurringScheduleDto } from '../dto/create-recurring-schedule.dto';
import { CalendarService } from '../services/calendar.service';

@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('week')
  @ApiOperation({ summary: 'Get calendar week lessons' })
  @ApiOkResponse({ type: [CalendarLessonDto] })
  public async getWeek(
    @Request() req: RequestExtended,
    @Query('startDate') startDate?: string,
  ): Promise<CalendarLessonDto[]> {
    const lessons = await this.calendarService.getWeek(req.user!.id, startDate);
    return lessons.map((lesson) => transformToDto(CalendarLessonDto, lesson));
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
  @ApiOperation({ summary: 'Create recurring schedule' })
  @ApiOkResponse({ type: [CalendarLessonDto] })
  public async createRecurringSchedule(
    @Request() req: RequestExtended,
    @Body() data: CreateRecurringScheduleDto,
  ): Promise<CalendarLessonDto[]> {
    const lessons = await this.calendarService.createRecurringSchedule(req.user!.id, data);
    return lessons.map((lesson) => transformToDto(CalendarLessonDto, lesson));
  }

  @Post('lessons')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create one-time lesson' })
  @ApiOkResponse({ type: CalendarLessonDto })
  public async createOneTimeLesson(
    @Request() req: RequestExtended,
    @Body() data: CreateOneTimeLessonDto,
  ): Promise<CalendarLessonDto> {
    const lesson = await this.calendarService.createOneTimeLesson(req.user!.id, data);
    return transformToDto(CalendarLessonDto, lesson);
  }
}
