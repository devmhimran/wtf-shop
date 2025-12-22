'use client';

import { PageContentForm } from '@/components/forms/page-content-form';
import { useReturnAndExchangePage } from '@/hooks/use-singular-page';
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

export default function ReturnsAndExchangesDashboardPage() {
  const [isPending, setIsPending] = useState(false);
  const {
    updateReturnAndExchangePageMutateAsync,
    fetchReturnAndExchangeData,
    fetchReturnAndExchange,
  } = useReturnAndExchangePage();

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
    if (fetchReturnAndExchangeData) {
      form.reset({
        title: fetchReturnAndExchangeData.title,
        content: fetchReturnAndExchangeData.content,
        metaTitle: fetchReturnAndExchangeData.metaTitle,
        metaDescription: fetchReturnAndExchangeData.metaDescription,
      });
    }
  }, [fetchReturnAndExchangeData, form]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsPending(true);
    const response = updateReturnAndExchangePageMutateAsync(data);

    toast.promise(response, {
      loading: 'Updating Returns and Exchanges page...',
      success: 'Returns and Exchanges page updated successfully!',
      error: 'Failed to update Returns and Exchanges page.',
    });
  }

  return fetchReturnAndExchange.isLoading ? (
    <p>Loading...</p>
  ) : (
    <PageContentForm form={form} onSubmit={onSubmit} isPending={isPending} />
  );
}
