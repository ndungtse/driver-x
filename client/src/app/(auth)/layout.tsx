import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Driver Tracker</h1>
          <p className="text-muted-foreground mt-2">ELD Logbook System</p>
        </div>
        {children}
      </div>
    </div>
  );
}

