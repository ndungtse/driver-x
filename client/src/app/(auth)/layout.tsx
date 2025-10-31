
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Driver Tracker</h1>
          <p className="text-muted-foreground mt-2">ELD Logbook System</p>
        </div>
        {children}
      </div>
    </div>
  );
}

