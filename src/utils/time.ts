export function minutesToHHMM(minutes: number): string {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes >= 1440) {
    throw new Error(`Invalid minutes value: ${minutes}`);
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calcDuration(startMinutes: number, endMinutes: number): number {
  if (endMinutes < startMinutes) {
    throw new Error(`End (${endMinutes}) must be >= start (${startMinutes})`);
  }
  return endMinutes - startMinutes;
}
