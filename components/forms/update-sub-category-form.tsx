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
import { useGetAllCategories, useSubCategories } from '@/hooks';
import { CategorySearchAndSelect } from '../pages/categories';
import { CategoryType, SubCategoryType } from '@/types';

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
  category: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional(),
});

export function UpdateSubCategoryForm({
  setIsOpen,
  data,
}: {
  setIsOpen: (open: boolean) => void;
  data: SubCategoryType | null;
}) {
  const [isPending, setIsPending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Pick<
    CategoryType,
    'id' | 'name'
  > | null>(
    data?.category ? { id: data.category.id, name: data.category.name } : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || '',
      slug: data?.slug || '',
    },
  });

  const { updateSubCategoryAsync } = useSubCategories();

  const { fetchAllCategoriesMutationData } = useGetAllCategories(
    searchQuery ? `?search=${searchQuery}` : ''
  );

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    if (!selectedCategory?.id) return;
    if (!data?.slug) return;
    const payload = {
      slug: data.slug,
      data: {
        name: formData.name,
        categoryId: selectedCategory?.id,
        slug: formData.slug,
      },
    };

    const response = updateSubCategoryAsync(payload);

    setIsPending(true);
    toast.promise(response, {
      loading: 'Creating  sub-category...',
      success: (response) => {
        form.reset();
        setIsPending(false);
        setIsOpen(false);
        return response.message || 'Successfully updated sub-category!';
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
          name='category'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategorySearchAndSelect
                  placeholder='Search category...'
                  search={async (query: string) => {
                    setSearchQuery(query);
                    const categories =
                      fetchAllCategoriesMutationData?.data || [];
                    return categories.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    }));
                  }}
                  onSelect={(option) => {
                    const category = {
                      id: option.value,
                      name: option.label,
                    };
                    setSearchQuery('');
                    setSelectedCategory(category);
                    field.onChange(category);
                  }}
                />
              </FormControl>
              <FormMessage />

              {selectedCategory && (
                <div className='text-sm shadow-sm p-3 mt-2 rounded-md space-y-2'>
                  <div>Category Name</div>
                  <div className='font-semibold'>{selectedCategory.name}</div>
                </div>
              )}
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
