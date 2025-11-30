'use client';

import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useAdminUsersMutation } from '@/hooks/use-admin-users';
import { getErrorResponse } from '@/lib/utils';
import { UsersType } from '@/types';

export const FormSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Username must be at least 2 characters.',
    }),
    email: z
      .email({ message: 'Please enter a valid email address' })
      .min(5, { message: 'Email must be at least 5 characters long' }),

    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .optional()
      .or(z.literal('')),

    confirmPassword: z.string().optional().or(z.literal('')),

    role: z.enum(['SUPER_ADMIN', 'ADMIN'], {
      message: 'Please select a valid role',
    }),
    isActive: z.enum(['ACTIVE', 'INACTIVE'], {
      message: 'Please select a valid status',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function UpdateUserForm({
  setIsOpen,
  data,
}: {
  setIsOpen: (open: boolean) => void;
  data: UsersType | null;
}) {
  const [isPending, setIsPending] = useState(false);
  const { updateUserAsync } = useAdminUsersMutation();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || '',
      email: data?.email || '',
      password: '',
      confirmPassword: '',
      role: data?.role || 'ADMIN',
      isActive: data?.isActive ? 'ACTIVE' : 'INACTIVE',
    },
  });

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = formData;

    if (!data) return;

    const payload = {
      ...rest,
      id: data.id,
      isActive: formData.isActive === 'ACTIVE' ? true : false,
    };

    const response = updateUserAsync(payload);

    setIsPending(true);
    toast.promise(response, {
      loading: 'Creating User...',
      success: (response) => {
        form.reset();
        setIsPending(false);
        setIsOpen(false);
        return response.message || 'Successfully updated User!';
      },

      error: (error) => {
        setIsPending(false);
        return getErrorResponse(error);
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user name'
                  {...field}
                />
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
                  className='w-full'
                  placeholder='Enter user email'
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
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user password'
                  type='password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter user confirm password'
                  type='password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='role'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a user role' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-9999'>
                  <SelectItem value='ADMIN'>Admin</SelectItem>
                  <SelectItem value='SUPER_ADMIN'>Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='isActive'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a user role' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-9999'>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='INACTIVE'>Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={isPending || !form.formState.isDirty}
          className='flex justify-start'
        >
          {isPending && <Loader2Icon className='animate-spin' />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
