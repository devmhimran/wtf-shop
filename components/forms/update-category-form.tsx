'use client';

import { getErrorResponse, generateSlug } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2Icon } from 'lucide-react';
import { useCategories } from '@/hooks';
import { CategoryType } from '@/types';

const FormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters'),

  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        'Slug must contain only lowercase letters, numbers, and hyphens. No spaces allowed.',
    }),
});

export function UpdateCategoryForm({
  setIsOpen,
  data,
}: {
  setIsOpen: (open: boolean) => void;
  data: CategoryType | null;
}) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || '',
      slug: data?.slug || '',
    },
  });

  const { updateCategoryAsync } = useCategories();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const response = updateCategoryAsync(data);

    setIsPending(true);
    toast.promise(response, {
      loading: 'Creating User...',
      success: (response) => {
        form.reset();
        setIsPending(false);
        setIsOpen(false);
        return response.data?.message || 'Successfully updated Category!';
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
                  placeholder='Enter category name'
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    const slug = generateSlug(e.target.value);
                    form.setValue('slug', slug);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='slug'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Auto-generated from name'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          disabled={isPending}
          className='flex justify-start'
        >
          {isPending && <Loader2Icon className='animate-spin' />}
          Edit
        </Button>
      </form>
    </Form>
  );
}
