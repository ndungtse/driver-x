'use client';

import { cn } from "@/lib/utils";

export function DashboardBackground({className}: {className?: string}) {
  return (
    <div className={cn("fixed inset-0 pointer-events-none overflow-hidden z-0", className)}>
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
    </div>
  );
}
