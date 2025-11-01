'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLogin } from '../hooks/useLogin';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const loginMutation = useLogin();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input {...field} type='text' placeholder='Enter your username' />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              {/* <Input {...field} type='password' placeholder='Enter your password' /> */}
              <InputGroup>
                <InputGroupInput {...field} type={showPassword ? 'text' : 'password'} placeholder='Enter your password' />
                <InputGroupAddon align={"inline-end"}>
                  <Button variant='ghost' type='button' size='icon' onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeIcon className='size-4' /> : <EyeOffIcon className='size-4' />}
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
      />

      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
    </Form>
  );
}

