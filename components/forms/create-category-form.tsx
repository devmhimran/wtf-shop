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
import { Modal } from '../shared';
import { ProductFeaturedImage } from '../pages/products';
import { MediaType } from '@/types';

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

  image: z
    .object({
      id: z.number(),
      fileUrl: z.string(),
      fileName: z.string(),
    })
    .nullable()
    .optional(),
});

export function CreateCategoryForm({
  setIsOpen,
}: {
  setIsOpen: (open: boolean) => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [openCategoryImage, setOpenCategoryImage] = useState(false);
  const [categoryImage, setCategoryImage] = useState<MediaType | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      slug: '',
      image: null,
    },
  });

  const { createCategoryAsync } = useCategories();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const payload = {
      name: data.name,
      slug: data.slug,
      imageId: categoryImage?.id || null,
    };
    const response = createCategoryAsync(payload);

    setIsPending(true);
    toast.promise(response, {
      loading: 'Creating category...',
      success: (response) => {
        form.reset();
        setIsPending(false);
        setIsOpen(false);
        return response.message || 'Successfully created category!';
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

        <FormField
          control={form.control}
          name='image'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Image (Optional)</FormLabel>
              <FormControl>
                <div className='space-y-2'>
                  {categoryImage ? (
                    <div className='flex items-center gap-3 p-3 border rounded-md'>
                      <img
                        src={categoryImage.fileUrl}
                        alt={categoryImage.fileName}
                        className='w-16 h-16 object-cover rounded'
                      />
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>
                          {categoryImage.fileName}
                        </p>
                      </div>
                      <Button
                        type='button'
                        variant='destructive'
                        size='sm'
                        onClick={() => {
                          setCategoryImage(null);
                          field.onChange(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setOpenCategoryImage(true)}
                    >
                      Select Image
                    </Button>
                  )}
                </div>
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
          Create
        </Button>
      </form>
      <Modal
        isOpen={openCategoryImage}
        setIsOpen={setOpenCategoryImage}
        title='Select Category Image'
        description='Choose from media library or upload new'
      >
        <ProductFeaturedImage
          image={categoryImage}
          setImage={(img) => {
            setCategoryImage(img);
            form.setValue('image', img);
          }}
          setIsOpen={setOpenCategoryImage}
        />
      </Modal>
    </Form>
  );
}
