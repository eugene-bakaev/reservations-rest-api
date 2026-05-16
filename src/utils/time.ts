export function minutesToHHMM(minutes: number): string {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes >= 1440) {
    throw new Error(`Invalid minutes value: ${minutes}`);
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function calcDuration(startMinutes: number, endMinutes: number): number {
  if (endMinutes < startMinutes) {
    throw new Error(`End (${endMinutes}) must be >= start (${startMinutes})`);
  }
  return endMinutes - startMinutes;
}

export function toUtcDateString(timestampMs: number): string {
  const date = new Date(timestampMs);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
