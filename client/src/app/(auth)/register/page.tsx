import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new driver account</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

