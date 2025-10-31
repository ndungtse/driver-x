'use client';

import { DailyLog } from '@/types/models';
import { format } from 'date-fns';

interface LogbookHeaderProps {
  dailyLog: DailyLog;
}

export function LogbookHeader({ dailyLog }: LogbookHeaderProps) {
  const formattedDate = dailyLog.date ? format(new Date(dailyLog.date), 'MM/dd/yyyy') : '';

  return (
    <div className="grid grid-cols-2 gap-6 p-4 border-b">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Date</label>
          <p className="text-sm font-medium">{formattedDate}</p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Driver's Signature</label>
          <p className="text-sm">{dailyLog.driver_name || 'N/A'}</p>
          {dailyLog.driver_signature && (
            <p className="text-xs text-muted-foreground italic mt-1">
              {dailyLog.driver_signature}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Name of Co-Driver</label>
          <p className="text-sm">{dailyLog.co_driver_name || 'N/A'}</p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Home Operating Center</label>
          <p className="text-sm">{dailyLog.home_terminal || 'N/A'}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Vehicle Numbers</label>
          <p className="text-sm">
            {dailyLog.tractor_number ? `Tractor: ${dailyLog.tractor_number}` : 'N/A'}
            {dailyLog.trailer_numbers && dailyLog.trailer_numbers.length > 0 && (
              <>
                {' / '}
                {dailyLog.trailer_numbers.map((trailer, idx) => (
                  <span key={idx}>
                    {trailer}
                    {idx < dailyLog.trailer_numbers.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Total Miles Driving Today</label>
            <p className="text-sm font-medium">{dailyLog.total_miles_driven.toFixed(0)}</p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Total Truck Mileage Today</label>
            <p className="text-sm font-medium">{dailyLog.total_truck_mileage.toFixed(0)}</p>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Carrier Name</label>
          <p className="text-sm">{dailyLog.carrier_name || 'N/A'}</p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Shipper</label>
          <p className="text-sm">{dailyLog.shipper || 'N/A'}</p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Commodity</label>
          <p className="text-sm">{dailyLog.commodity || 'N/A'}</p>
        </div>

        {dailyLog.shipping_doc_numbers && dailyLog.shipping_doc_numbers.length > 0 && (
          <div>
            <label className="text-xs text-muted-foreground">Shipping Doc Numbers</label>
            <p className="text-sm">
              {dailyLog.shipping_doc_numbers.map((doc, idx) => (
                <span key={idx}>
                  {doc}
                  {idx < dailyLog.shipping_doc_numbers.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

