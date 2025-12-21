'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api-helper';
import { getErrorResponse } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const FormSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Username must be at least 2 characters.',
    }),
    email: z
      .email({ message: 'Please enter a valid email address' })
      .min(5, { message: 'Email must be at least 5 characters long' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function SignupForm() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const result = authApi.signUp({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    setIsPending(true);
    toast.promise(result, {
      loading: 'Signing up...',
      success: async () => {
        form.reset();
        setIsPending(false);
        const response = await authApi.signIn({
          email: data.email,
          password: data.password,
        });
        if (response.status === 200) {
          router.push('/c/dashboard');
        }
        return 'Signed up successfully!';
      },
      error: (error) => {
        setIsPending(false);
        return getErrorResponse(error);
      },
    });
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold'>Sign Up</CardTitle>
          <CardDescription className=''>
            Create an account to get started!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='enter your name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='enter your email'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter your password'
                        type={!showPass ? 'password' : 'text'}
                        autoComplete='new-password'
                        {...field}
                      />
                    </FormControl>
                    {!showPass ? (
                      <Eye
                        className='w-5 h-5 absolute right-2 top-7.5'
                        onClick={() => setShowPass(true)}
                      />
                    ) : (
                      <EyeOff
                        className='w-5 h-5 absolute right-2 top-7.5'
                        onClick={() => setShowPass(false)}
                      />
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='relative'>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter your password'
                        type={!showConfirmPass ? 'password' : 'text'}
                        autoComplete='confirm-password'
                        {...field}
                      />
                    </FormControl>
                    {!showConfirmPass ? (
                      <Eye
                        className='w-5 h-5 absolute right-2 top-7.5'
                        onClick={() => setShowConfirmPass(true)}
                      />
                    ) : (
                      <EyeOff
                        className='w-5 h-5 absolute right-2 top-7.5'
                        onClick={() => setShowConfirmPass(false)}
                      />
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' disabled={isPending} className='w-full'>
                {isPending && <Loader2Icon className='animate-spin' />} Sign up
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
