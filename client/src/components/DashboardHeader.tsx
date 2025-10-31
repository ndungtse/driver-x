'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function DashboardHeader() {
  const { user, logout } = useAuth();

  const initials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : user?.username?.[0]?.toUpperCase() || 'D';

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/trips" className="text-2xl font-bold">
          Driver Tracker
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{user.first_name || user.username}</p>
                {user.driver && (
                  <p className="text-muted-foreground text-xs">{user.driver.carrier_name}</p>
                )}
              </div>
            </div>
          )}
          <Button variant="outline" onClick={logout} size="sm">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

