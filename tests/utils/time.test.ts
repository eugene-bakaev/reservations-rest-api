import { minutesToHHMM, calcDuration, toUtcDateString } from '@/utils/time';

describe('minutesToHHMM', () => {
  it('formats 0 minutes as 00:00', () => {
    expect(minutesToHHMM(0)).toBe('00:00');
  });
  it('formats 60 minutes as 01:00', () => {
    expect(minutesToHHMM(60)).toBe('01:00');
  });
  it('formats 300 minutes as 05:00', () => {
    expect(minutesToHHMM(300)).toBe('05:00');
  });
  it('formats 75 minutes as 01:15', () => {
    expect(minutesToHHMM(75)).toBe('01:15');
  });
  it('formats 1439 minutes as 23:59 (one minute before midnight)', () => {
    expect(minutesToHHMM(1439)).toBe('23:59');
  });
  it('throws for negative minutes', () => {
    expect(() => minutesToHHMM(-1)).toThrow();
  });
  it('throws for minutes >= 1440', () => {
    expect(() => minutesToHHMM(1440)).toThrow();
  });
});

describe('calcDuration', () => {
  it('returns the difference between end and start', () => {
    expect(calcDuration(300, 480)).toBe(180);
  });
  it('returns 0 for equal values', () => {
    expect(calcDuration(600, 600)).toBe(0);
  });
  it('throws when end is before start', () => {
    expect(() => calcDuration(500, 400)).toThrow();
  });
});

describe('toUtcDateString', () => {
  it('formats midnight UTC timestamp as YYYY-MM-DD', () => {
    expect(toUtcDateString(1593561600000)).toBe('2020-07-01');
  });
  it('formats 2020-06-04 UTC', () => {
    expect(toUtcDateString(1591228800000)).toBe('2020-06-04');
  });
});
