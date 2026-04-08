export class UserTimezoneChangedEvent {
  public static readonly EVENT_NAME = 'user.timezone.changed';

  constructor(
    public readonly userId: string,
    public readonly oldTimezone: string,
    public readonly newTimezone: string,
  ) {}
}
