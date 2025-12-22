'use client';

import { Loader2Icon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CreateSingularPageType } from '@/types';
import { Textarea } from '../ui/textarea';
import { TextEditor } from '../shared/text-editor';

type PageContentFormProps = {
  form: UseFormReturn<CreateSingularPageType>;
  onSubmit: (data: CreateSingularPageType) => void;
  isPending?: boolean;
};

export function PageContentForm({
  form,
  onSubmit,
  isPending = false,
}: PageContentFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  className='w-full bg-white'
                  placeholder='Enter title'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardContent className='flex gap-6'>
            <div className='space-y-5 w-full'>
              <FormField
                control={form.control}
                name='metaTitle'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input
                        className='w-full bg-white'
                        placeholder='Enter meta title'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='metaDescription'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className='resize-none'
                        placeholder='Enter meta description'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardContent>
            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Content</FormLabel>
                  <FormControl>
                    <TextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2Icon className='mr-2 animate-spin' />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
