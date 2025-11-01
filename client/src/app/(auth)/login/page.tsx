import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <Card className="w-full backdrop-blur-sm bg-card/95 border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Sign in to your driver account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

