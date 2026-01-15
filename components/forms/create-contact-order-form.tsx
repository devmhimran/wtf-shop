'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { productApi } from '@/lib/api-helper/product-api';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  note: z.string().optional(),
});

interface Customization {
  id: string;
  image: File | null;
  imagePreview: string;
  note: string;
}

interface ContactOrderItem {
  productId: number;
  title: string;
  slug: string;
  quantity: number;
  image: string;
  color: string;
  size: string;
  printSide: 'one' | 'two';
  customizations: Customization[];
}

type CreateContactOrderFormType = {
  setIsOpen: (isOpen: boolean) => void;
  items: ContactOrderItem[];
  onSuccess?: () => void;
};

export function CreateContactOrderForm({
  setIsOpen,
  items,
  onSuccess,
}: CreateContactOrderFormType) {
  const [isPending, setIsPending] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      note: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      items: items.map((item) => ({
        ...item,
        productId: item.productId,
        image: item.image,
        customizations: (item.customizations || []).map((custom) => ({
          ...custom,
          image: undefined,
          imagePreview: custom.imagePreview,
        })),
      })),
    };
    const response = productApi.public.publicOrder.contactOrder(payload);
    setIsPending(true);
    toast.promise(response, {
      loading: 'Sending your request...',
      success: () => {
        setIsOpen(false);
        form.reset();
        setIsPending(false);
        if (onSuccess) {
          onSuccess();
        }
        return 'Your request has been sent successfully!';
      },
      error: (error) =>
        error?.response?.data?.message ||
        'Something went wrong. Please try again.',
    });
  }

  return (
    <div className='grid gap-6 md:grid-cols-2 overflow-y-scroll h-[calc(100vh-20rem)] md:h-auto'>
      {/* Left Column: Form */}
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Your name' {...field} />
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
                    <Input placeholder='your.email@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder='Your phone number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Any specific instructions?'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end pt-4'>
              <Button
                type='submit'
                className='w-full md:w-auto'
                disabled={isPending}
              >
                {isPending ? 'Sending...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Right Column: Order Summary */}
      <div className='bg-muted/30 rounded-lg border p-2 md:p-4'>
        <h3 className='font-semibold mb-4'>Order Summary</h3>
        <div className='h-[calc(100vh-20rem)] pr-4 overflow-y-auto'>
          <div className='space-y-6'>
            {items.map((item, index) => (
              <div key={index} className='bg-background rounded-md border p-3'>
                <div className='flex flex-col gap-3 mb-3'>
                  <div className='relative h-16 w-16 rounded-md overflow-hidden border shrink-0'>
                    <Image
                      src={item.image}
                      alt={item.title || 'Product Image'}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-medium text-sm truncate'>
                      {item.title}
                    </h4>
                    <div className='text-xs text-muted-foreground space-y-1 mt-1'>
                      <div className='flex justify-between'>
                        <span>Color:</span>
                        <span className='font-medium text-foreground'>
                          {item.color}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Size:</span>
                        <span className='font-medium text-foreground'>
                          {item.size}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Print Side:</span>
                        <span className='font-medium text-foreground capitalize'>
                          {item.printSide}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Quantity:</span>
                        <span className='font-medium text-foreground'>
                          {item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {item.customizations && item.customizations.length > 0 && (
                  <>
                    <Separator className='my-2' />
                    <div className='space-y-2'>
                      <p className='text-xs font-semibold'>Customizations:</p>
                      {item.customizations.map((custom, cIndex: number) => (
                        <div
                          key={cIndex}
                          className='flex gap-2 items-start text-xs border rounded p-2'
                        >
                          {custom.imagePreview && (
                            <div className='relative h-10 w-10 shrink-0 rounded overflow-hidden border'>
                              <Image
                                src={custom.imagePreview}
                                alt='Custom'
                                fill
                                className='object-cover'
                              />
                            </div>
                          )}
                          <div className='flex-1'>
                            <p className='text-muted-foreground line-clamp-2'>
                              <span className='font-medium text-foreground'>
                                Note:{' '}
                              </span>
                              {custom.note || 'No note provided'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
