'use client';

import { CreateShippingChargeType, ShippingChargeType } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useShippingCharge } from '@/hooks';
import { toast } from 'sonner';
import { getErrorResponse } from '@/lib/utils';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2Icon } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

type UpdateShippingChargeFormProps = {
  data: ShippingChargeType | null;
  setIsOpen: (value: boolean) => void;
};

const FormSchema = z
  .object({
    region: z.enum(['INSIDE_AU', 'OUTSIDE_AU'], {
      message: 'Region must be either INSIDE_AU or OUTSIDE_AU',
    }),
    minQty: z
      .number()
      .int()
      .min(1, { message: 'Minimum quantity must be at least 1' }),
    maxQty: z.number().int().min(1).optional(),
    baseCharge: z
      .number()
      .min(0, { message: 'Base charge must be a positive number' }),
    additionalChargePerItem: z.number().min(0).optional(),
    freeShipping: z.boolean().default(false).optional(),
  })
  .refine(
    (data) => {
      if (data.maxQty !== undefined && data.maxQty <= data.minQty) {
        return false;
      }
      return true;
    },
    {
      message: 'Maximum quantity must be greater than minimum quantity',
      path: ['maxQty'],
    }
  );

export function UpdateShippingChargeForm({
  data,
  setIsOpen,
}: UpdateShippingChargeFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      region: data?.region || 'INSIDE_AU',
      minQty: data?.minQty || 1,
      maxQty: data?.maxQty || undefined,
      baseCharge: data?.baseCharge || 0,
      additionalChargePerItem: data?.additionalChargePerItem || undefined,
      freeShipping: data?.freeShipping || false,
    },
  });

  const { updateShippingChargeAsync } = useShippingCharge();

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    if (!data) return;
    const payload: CreateShippingChargeType = {
      region: formData.region,
      minQty: formData.minQty,
      baseCharge: formData.baseCharge,
      freeShipping: formData.freeShipping ?? false,
      additionalChargePerItem: formData.additionalChargePerItem ?? 0,
    };

    if (formData.maxQty !== undefined) {
      payload.maxQty = formData.maxQty;
    }

    const response = updateShippingChargeAsync({
      id: data.id,
      updateData: payload,
    });
    setIsPending(true);
    toast.promise(response, {
      loading: 'Updating Shipping Charge...',
      success: (response) => {
        form.reset();
        setIsPending(false);
        setIsOpen(false);
        return response.message || 'Successfully updated Shipping Charge!';
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
          name='region'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select a region' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='z-9999'>
                  <SelectItem value='INSIDE_AU'>Inside AU</SelectItem>
                  <SelectItem value='OUTSIDE_AU'>Outside AU</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='minQty'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Quantity</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='Enter minimum quantity'
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 1)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='maxQty'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Quantity (Optional)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='Enter maximum quantity'
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val ? parseInt(val) : undefined);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='baseCharge'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Charge</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.01'
                  placeholder='Enter base charge'
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='additionalChargePerItem'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Charge Per Item (Optional)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.01'
                  placeholder='Enter additional charge per item'
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val ? parseFloat(val) : undefined);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='freeShipping'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>Free Shipping</FormLabel>
              </div>
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
