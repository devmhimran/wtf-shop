'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Loader2Icon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { useSizes } from '@/hooks';
import { toast } from 'sonner';
import { getErrorResponse } from '@/lib/utils';
import { SizeType } from '@/types';

type CreateSizesFormProps = {
  setIsOpen: (open: boolean) => void;
  data: SizeType | null;
};

const FormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name must be at least 1 character long')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^\S+$/, 'Only a single word is allowed (no spaces)'),
});

export function UpdateSizesForm({ setIsOpen, data }: CreateSizesFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || '',
    },
  });

  const { updateSizeAsync } = useSizes();

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    if (!data?.id) return;
    const response = updateSizeAsync({ id: data.id, updateData: formData });

    setIsPending(true);
    toast.promise(response, {
      loading: 'Updating Size...',
      success: (response) => {
        form.reset();
        setIsPending(false);
        setIsOpen(false);
        return response.message || 'Successfully updated Size!';
      },

      error: (error) => {
        setIsPending(false);
        const errorResponse = getErrorResponse(error);
        return errorResponse;
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
                  placeholder='Enter size name'
                  {...field}
                />
              </FormControl>
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
