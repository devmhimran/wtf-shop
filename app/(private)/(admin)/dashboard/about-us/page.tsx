'use client';

import { PageContentForm } from '@/components/forms/page-content-form';
import { useAboutPage } from '@/hooks/use-singular-page';
import { zodResolver } from '@hookform/resolvers/zod';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const FormSchema = z.object({
  title: z
    .string()
    .min(5, 'title must be at least 5 character long')
    .max(100, 'title cannot exceed 100 characters'),
  content: z
    .string()
    .min(20, 'content must be at least 20 character long')
    .max(2000, 'content cannot exceed 2000 characters'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export default function AboutUsDashboardPage() {
  const [isPending, setIsPending] = useState(false);
  const { updateAboutUsPageMutateAsync, fetchAboutUsData, fetchAboutUs } =
    useAboutPage();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
    },
  });

  useEffect(() => {
    if (fetchAboutUsData) {
      form.reset({
        title: fetchAboutUsData.title,
        content: fetchAboutUsData.content,
        metaTitle: fetchAboutUsData.metaTitle,
        metaDescription: fetchAboutUsData.metaDescription,
      });
    }
  }, [fetchAboutUsData, form]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsPending(true);
    const response = updateAboutUsPageMutateAsync(data);

    toast.promise(response, {
      loading: 'Updating About Us page...',
      success: 'About Us page updated successfully!',
      error: 'Failed to update About Us page.',
    });
  }

  return fetchAboutUs.isLoading ? (
    <p>Loading...</p>
  ) : (
    <PageContentForm form={form} onSubmit={onSubmit} isPending={isPending} />
  );
}
