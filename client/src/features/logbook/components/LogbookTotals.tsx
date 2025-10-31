'use client';

import { DailyLog } from '@/types/models';
import { formatHoursToHHMM, formatHHMMToString } from '../utils/totalsCalculator';

interface LogbookTotalsProps {
  dailyLog: DailyLog;
}

export function LogbookTotals({ dailyLog }: LogbookTotalsProps) {
  const offDuty = formatHoursToHHMM(dailyLog.off_duty_hours);
  const sleeper = formatHoursToHHMM(dailyLog.sleeper_berth_hours);
  const driving = formatHoursToHHMM(dailyLog.driving_hours);
  const onDuty = formatHoursToHHMM(dailyLog.on_duty_not_driving_hours);

  const totalHours = offDuty.hours + sleeper.hours + driving.hours + onDuty.hours;
  const totalMinutes =
    offDuty.minutes + sleeper.minutes + driving.minutes + onDuty.minutes;
  const adjustedTotal = {
    hours: totalHours + Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };

  return (
    <div className="p-4 border-t">
      <h3 className="text-sm font-semibold mb-3">HOURS</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Status</th>
            <th className="text-right py-2 pr-4">Hours</th>
            <th className="text-right py-2">Minutes</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-2">Line 1 (Off Duty)</td>
            <td className="text-right pr-4">{offDuty.hours}</td>
            <td className="text-right">{offDuty.minutes.toString().padStart(2, '0')}</td>
          </tr>
          <tr className="border-b">
            <td className="py-2">Line 2 (Sleeper Berth)</td>
            <td className="text-right pr-4">{sleeper.hours}</td>
            <td className="text-right">{sleeper.minutes.toString().padStart(2, '0')}</td>
          </tr>
          <tr className="border-b">
            <td className="py-2">Line 3 (Driving)</td>
            <td className="text-right pr-4">{driving.hours}</td>
            <td className="text-right">{driving.minutes.toString().padStart(2, '0')}</td>
          </tr>
          <tr className="border-b">
            <td className="py-2">Line 4 (On Duty Not Driving)</td>
            <td className="text-right pr-4">{onDuty.hours}</td>
            <td className="text-right">{onDuty.minutes.toString().padStart(2, '0')}</td>
          </tr>
          <tr className="border-t-2 font-semibold">
            <td className="py-2">TOTAL</td>
            <td className="text-right pr-4">{adjustedTotal.hours}</td>
            <td className="text-right">{adjustedTotal.minutes.toString().padStart(2, '0')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

