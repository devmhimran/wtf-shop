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
import { generateSlug } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import dynamic from 'next/dynamic';

const TextEditor = dynamic(
  () => import('@/components/shared/text-editor').then((mod) => mod.TextEditor),
  {
    ssr: false,
  }
);
const formSchema = z
  .object({
    title: z.string().min(2, {
      message: 'title must be at least 2 characters.',
    }),
    description: z.string().refine(
      (val) => {
        const stripped = val.replace(/<[^>]*>/g, '').trim();
        return stripped.length > 0;
      },
      { message: 'Description is required.' }
    ),
    shortDescription: z.string().refine(
      (val) => {
        const stripped = val.replace(/<[^>]*>/g, '').trim();
        return stripped.length > 0;
      },
      { message: 'Short Description is required.' }
    ),
    additionalDesc: z.string().refine(
      (val) => {
        const stripped = val.replace(/<[^>]*>/g, '').trim();
        return stripped.length > 0;
      },
      { message: 'Additional Description is required.' }
    ),
    slug: z.string({ message: 'Slug is required.' }).min(2, {
      message: 'Slug must be at least 2 characters.',
    }),
  })
  .strict();

export function CreateProductForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl md:text-3xl font-bold'>Products</h1>

          <Button type='submit'>
            <Save className='mr-2 h-4 w-4' />
            Save Changes
          </Button>
        </div>

        <Card>
          <CardContent className='space-y-6'>
            <div className='flex gap-6 w-full'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='w-9/12'>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='product name or title'
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
                  <FormItem className='w-3/12'>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder='product slug' {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <TextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='flex gap-6 w-full'>
            <FormField
              control={form.control}
              name='shortDescription'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <TextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='additionalDesc'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Additional Description</FormLabel>
                  <FormControl>
                    <TextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
