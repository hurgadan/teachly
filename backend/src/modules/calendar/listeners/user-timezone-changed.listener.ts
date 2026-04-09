import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { UserTimezoneChangedEvent } from '../../users/events/user-timezone-changed.event';
import { CalendarService } from '../services/calendar.service';

@Injectable()
export class UserTimezoneChangedListener {
  constructor(private readonly calendarService: CalendarService) {}

  @OnEvent(UserTimezoneChangedEvent.EVENT_NAME, { async: true })
  async handle(event: UserTimezoneChangedEvent): Promise<void> {
    await this.calendarService.recalculateTimezone(
      event.userId,
      event.oldTimezone,
      event.newTimezone,
    );
  }
}
