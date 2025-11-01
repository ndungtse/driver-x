'use client';

import { AlternatingText } from '@/components/shared/AlternatingText';
import { AuthBackground } from '@/components/shared/AuthBackground';
import { DashboardBackground } from '@/components/shared/DashboardBackground';
import { ModeToggle } from '@/components/ThemeToggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative bg-background overflow-hidden">
      <div className="absolute top-3 right-3 z-30">
        <ModeToggle />
      </div>
      <AuthBackground />
      <div className="relative z-20 min-h-screen grid lg:grid-cols-2">
        <div className="hidden lg:flex relative">
          <div className="w-full flex items-center">
            <AlternatingText />
          </div>
        </div>
        <div className="flex bg-background/70 backdrop-blur-sm relative items-center justify-center p-8 lg:p-12">
          <DashboardBackground className="z-50"/>
          <div className="w-full max-w-md">
            <div className="text-center mb-8 lg:hidden">
              <h1 className="text-3xl font-bold">Driver Tracker</h1>
              <p className="text-muted-foreground mt-2">ELD Logbook System</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

