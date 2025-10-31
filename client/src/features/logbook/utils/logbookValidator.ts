import { DailyLog } from '@/types/models';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateLogbook(dailyLog: DailyLog): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const totalHours =
    dailyLog.off_duty_hours +
    dailyLog.sleeper_berth_hours +
    dailyLog.driving_hours +
    dailyLog.on_duty_not_driving_hours;

  if (Math.abs(totalHours - 24) > 0.1) {
    errors.push(`Timeline does not total 24 hours (currently ${totalHours.toFixed(2)} hours)`);
  }

  if (!dailyLog.driver_name || dailyLog.driver_name.trim() === '') {
    warnings.push('Driver name missing');
  }

  if (!dailyLog.tractor_number || dailyLog.tractor_number.trim() === '') {
    warnings.push('Tractor number missing');
  }

  if (!dailyLog.date) {
    errors.push('Date missing');
  }

  if (!dailyLog.activities || dailyLog.activities.length === 0) {
    warnings.push('No activities recorded for this day');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

