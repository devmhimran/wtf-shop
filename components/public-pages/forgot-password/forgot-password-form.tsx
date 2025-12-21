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
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type ForgotPasswordFormProps = {
  setSendLink: (value: boolean) => void;
  setEmail: (email: string) => void;
};

const FormSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .min(5, { message: 'Email must be at least 5 characters long' }),
});

export function ForgotPasswordForm({
  setSendLink,
  setEmail,
}: ForgotPasswordFormProps) {
  const [isPending, setIsPending] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {};
  return (
    <Card className='w-full max-w-md'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold'>Forgot Password</CardTitle>
        <CardDescription className=''>
          No worries! Enter your email address below and we&apos; ll send you
          instructions to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='enter your email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={isPending} className='w-full'>
              {isPending && <Loader2Icon className='animate-spin' />} Reset
              Password
            </Button>
          </form>
        </Form>
        <div className='mt-5 flex justify-center'>
          <Link
            href='/signin'
            className='text-sm hover:underline flex items-center gap-1 text-primary'
          >
            <ArrowLeft className='w-4 h-4' /> Back to signin
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
