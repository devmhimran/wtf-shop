'use client';

import * as z from 'zod';
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
import { ChevronDownIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { usePromoCode } from '@/hooks/use-promo-code';
import { getErrorResponse } from '@/lib/utils';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';

const promoCodeSchema = z
  .object({
    code: z
      .string()
      .min(3, { message: 'Code must be at least 3 characters long' })
      .max(50, { message: 'Code must not exceed 50 characters' })
      .regex(/^[A-Z0-9_-]+$/, {
        message:
          'Code must contain only uppercase letters, numbers, hyphens, and underscores',
      }),
    title: z
      .string()
      .min(3, { message: 'Title must be at least 3 characters long' })
      .max(100, { message: 'Title must not exceed 100 characters' }),
    amount: z.number().int().min(1, { message: 'Amount must be at least 1' }),
    startDate: z
      .string()
      .min(1, { message: 'Start date is required' })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid start date format',
      }),
    endDate: z
      .string()
      .min(1, { message: 'End date is required' })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid end date format',
      }),
  })
  .strict()
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export function CreatePromoCodeForm({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('23:59:59');

  const form = useForm<z.infer<typeof promoCodeSchema>>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      title: '',
      code: '',
      amount: 0,
      startDate: '',
      endDate: '',
    },
  });

  const { createPromoCodeAsync } = usePromoCode();

  const combineDateAndTime = (date: Date, time: string) => {
    const [hours, minutes, seconds] = time.split(':');
    const combined = new Date(date);
    combined.setHours(
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds || '0')
    );
    return combined.toISOString();
  };

  function onSubmit(data: z.infer<typeof promoCodeSchema>) {
    const response = createPromoCodeAsync(data);

    setIsPending(true);
    toast.promise(response, {
      loading: 'Creating Size...',
      success: (response) => {
        form.reset();
        setIsPending(false);
        setIsOpen(false);
        return response.message || 'Successfully created Promo Code!';
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
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter category name'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='code'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Promo Code</FormLabel>
              <FormControl>
                <Input
                  className='w-full'
                  placeholder='Enter category name'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='Enter amount'
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
          name='startDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date & Time</FormLabel>
              <div className='flex gap-4'>
                <div className='flex flex-col gap-2 flex-1'>
                  <Label htmlFor='start-date-picker' className='px-1 text-xs'>
                    Date
                  </Label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        id='start-date-picker'
                        className='justify-between font-normal'
                      >
                        {startDate
                          ? startDate.toLocaleDateString()
                          : 'Select date'}
                        <ChevronDownIcon className='h-4 w-4' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto overflow-hidden p-0'
                      align='start'
                    >
                      <Calendar
                        mode='single'
                        selected={startDate}
                        captionLayout='dropdown'
                        onSelect={(date) => {
                          setStartDate(date);
                          if (date) {
                            field.onChange(combineDateAndTime(date, startTime));
                          }
                          setStartDateOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className='flex flex-col gap-2 flex-1'>
                  <Label htmlFor='start-time-picker' className='px-1 text-xs'>
                    Time
                  </Label>
                  <Input
                    type='time'
                    id='start-time-picker'
                    step='1'
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (startDate) {
                        field.onChange(
                          combineDateAndTime(startDate, e.target.value)
                        );
                      }
                    }}
                    className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                  />
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='endDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date & Time</FormLabel>
              <div className='flex gap-4'>
                <div className='flex flex-col gap-2 flex-1'>
                  <Label htmlFor='end-date-picker' className='px-1 text-xs'>
                    Date
                  </Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        id='end-date-picker'
                        className='justify-between font-normal'
                      >
                        {endDate ? endDate.toLocaleDateString() : 'Select date'}
                        <ChevronDownIcon className='h-4 w-4' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto overflow-hidden p-0'
                      align='start'
                    >
                      <Calendar
                        mode='single'
                        selected={endDate}
                        captionLayout='dropdown'
                        onSelect={(date) => {
                          setEndDate(date);
                          if (date) {
                            field.onChange(combineDateAndTime(date, endTime));
                          }
                          setEndDateOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className='flex flex-col gap-2 flex-1'>
                  <Label htmlFor='end-time-picker' className='px-1 text-xs'>
                    Time
                  </Label>
                  <Input
                    type='time'
                    id='end-time-picker'
                    step='1'
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      if (endDate) {
                        field.onChange(
                          combineDateAndTime(endDate, e.target.value)
                        );
                      }
                    }}
                    className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                  />
                </div>
              </div>
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
    </Form>
  );
}
