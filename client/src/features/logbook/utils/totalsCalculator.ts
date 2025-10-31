export function formatHoursToHHMM(hours: number): { hours: number; minutes: number } {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round((totalMinutes % 60) / 15) * 15;
  return { hours: h, minutes: m === 60 ? 0 : m };
}

export function formatHHMMToString(hours: number, minutes: number): string {
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

