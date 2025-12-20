'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters long' }),
    email: z
      .email({ message: 'Please enter a valid email address' })
      .min(5, { message: 'Email must be at least 5 characters long' }),
    password: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 8, {
        message: 'Password must be at least 8 characters long',
      }),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  );

export default function ProfilePage() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const { fetchMe, updateUserAsync } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (fetchMe) {
      form.reset({
        name: fetchMe.name || '',
        email: fetchMe.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [fetchMe, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const response = updateUserAsync({
      name: values.name,
      password: values.password,
    });
    toast.promise(response, {
      loading: 'Updating profile...',
      success: 'Profile updated successfully!',
      error: 'Error updating profile.',
    });
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardContent>
          <h2 className='text-2xl font-bold mb-2'>Profile Settings</h2>
          <p className='text-sm text-muted-foreground mb-4'>
            Update your profile information below.
          </p>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Name:</span>
              <span className='text-muted-foreground'>
                {fetchMe?.name || 'Loading...'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Email:</span>
              <span className='text-muted-foreground'>
                {fetchMe?.email || 'Loading...'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Profile Settings</h3>
                <div className='flex gap-6'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem className='w-full'>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter your name' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='email'
                    disabled
                    render={({ field }) => (
                      <FormItem className='w-full'>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter your email' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Change Password</h3>
                <div className='flex gap-6'>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem className='relative w-full'>
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
                            className='w-5 h-5 absolute right-2 top-7.5 cursor-pointer'
                            onClick={() => setShowPass(true)}
                          />
                        ) : (
                          <EyeOff
                            className='w-5 h-5 absolute right-2 top-7.5 cursor-pointer'
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
                      <FormItem className='relative w-full'>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Confirm your password'
                            type={!showConfirmPass ? 'password' : 'text'}
                            autoComplete='new-password'
                            {...field}
                          />
                        </FormControl>
                        {!showConfirmPass ? (
                          <Eye
                            className='w-5 h-5 absolute right-2 top-7.5 cursor-pointer'
                            onClick={() => setShowConfirmPass(true)}
                          />
                        ) : (
                          <EyeOff
                            className='w-5 h-5 absolute right-2 top-7.5 cursor-pointer'
                            onClick={() => setShowConfirmPass(false)}
                          />
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Button type='submit' disabled={!form.formState.isDirty}>
                <Save />
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
