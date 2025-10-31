'use client';

import { Button } from '@/components/ui/button';
import { DownloadIcon, PrinterIcon } from 'lucide-react';

interface ExportButtonsProps {
  onPrint: () => void;
  onExportImage?: () => void;
}

export function ExportButtons({ onPrint, onExportImage }: ExportButtonsProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <PrinterIcon className="mr-2 size-4" />
        Print
      </Button>
      {onExportImage && (
        <Button variant="outline" size="sm" onClick={onExportImage}>
          <DownloadIcon className="mr-2 size-4" />
          Export Image
        </Button>
      )}
    </div>
  );
}

