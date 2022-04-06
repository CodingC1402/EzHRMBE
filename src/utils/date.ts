export namespace Time {
  export function createTime(hour?: number, minute?: number, second?: number): Date {
    const hourStr: string = String(hour || 0).padStart(2, '0');
    const minuteStr: string = String(minute || 0).padStart(2, '0');
    const secondStr: string = String(second || 0).padStart(2, '0');

    let dateStr = `2000-01-01T${hourStr}:${minuteStr}:${secondStr}`;
    let date = new Date(dateStr);

    return date;
  }

  // Don't use this :v idk what will happen
  export function createTimeWithUTC0(hour: number, minute: number, second: number) {
    const hourStr: string = String(hour || 0).padStart(2, '0');
    const minuteStr: string = String(minute || 0).padStart(2, '0');
    const secondStr: string = String(second || 0).padStart(2, '0');

    let dateStr = `2000-01-01T${hourStr}:${minuteStr}:${secondStr}+00:00`;
    let date = new Date(dateStr);

    return date;
  }
}