import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { useState } from 'react';

type ParamsType = {
  search: string;
  page: string;
  status: string;
  deliveryMethod: string;
  year: string;
  month: string;
  date: string;
};

type OrdersFilterProps = {
  setParams: React.Dispatch<React.SetStateAction<ParamsType>>;
  params: ParamsType;
  setIsOpen: (open: boolean) => void;
};

export function OrdersFilter({
  setParams,
  params,
  setIsOpen,
}: OrdersFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');

  const handleReset = () => {
    setParams({
      search: '',
      page: '1',
      status: '',
      deliveryMethod: '',
      year: '',
      month: '',
      date: '',
    });
  };

  const handleFilterChange = (key: keyof ParamsType, value: string) => {
    setParams((prev) => ({
      ...prev,
      [key]: value === 'all' ? '' : value,
      page: '1',
    }));
  };
  return (
    <div className='mt-4 space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Category Filter */}
        <div className='space-y-2'>
          <Label>Order Status</Label>
          <Select
            value={params.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Order Status' />
            </SelectTrigger>
            <SelectContent className='z-999'>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='PENDING'>Pending</SelectItem>
              <SelectItem value='CONFIRMED'>Confirmed</SelectItem>
              <SelectItem value='PROCESSING'>Processing</SelectItem>
              <SelectItem value='SHIPPING'>Shipping</SelectItem>
              <SelectItem value='COMPLETED'>Completed</SelectItem>
              <SelectItem value='CANCELLED'>Cancelled</SelectItem>
              <SelectItem value='RETURNED'>Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sub Category Filter */}
        <div className='space-y-2'>
          <Label>Delivery Method</Label>
          <Select
            value={params.deliveryMethod}
            onValueChange={(value) =>
              handleFilterChange('deliveryMethod', value)
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='All Delivery Methods' />
            </SelectTrigger>
            <SelectContent className='z-999'>
              <SelectItem value='all'>All Delivery Methods</SelectItem>
              <SelectItem value='SHIPPING'>Shipping</SelectItem>
              <SelectItem value='PICKUP'>Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='space-y-2'>
        <Label>Select Month / Date</Label>
        <Select
          value={selectedDateFilter}
          onValueChange={(value) => {
            setSelectedDateFilter(value);
            handleFilterChange('date', '');
            handleFilterChange('month', '');
            handleFilterChange('year', '');
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Date / Year' />
          </SelectTrigger>
          <SelectContent className='z-999'>
            <SelectItem value='all'>All Time</SelectItem>
            <SelectItem value='monthAndYear'>Month & Year</SelectItem>
            <SelectItem value='specificDate'>Specific Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedDateFilter === 'monthAndYear' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Select Month</Label>
            <Select
              value={params.month}
              onValueChange={(month) =>
                setParams((prev) => ({
                  ...prev,
                  month: month,
                  page: '1',
                  date: '',
                }))
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select month' />
              </SelectTrigger>
              <SelectContent className='z-999'>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {dayjs().month(i).format('MMMM')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Select Year</Label>
            <Select
              value={params.year}
              onValueChange={(year) =>
                setParams((prev) => ({
                  ...prev,
                  year: year,
                  page: '1',
                  date: '',
                }))
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select year' />
              </SelectTrigger>
              <SelectContent className='z-999'>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      {selectedDateFilter === 'specificDate' && (
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !params.date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {params.date
                  ? format(new Date(params.date), 'PPP')
                  : 'Pick start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0 z-999' align='start'>
              <Calendar
                mode='single'
                selected={params.date ? new Date(params.date) : undefined}
                onSelect={(date) => {
                  setParams((prev) => ({
                    ...prev,
                    date: date ? date.toISOString() : '',
                    page: '1',
                    month: '',
                    year: '',
                  }));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className='flex items-center justify-end gap-4'>
        {/* <h3 className='text-lg font-semibold'>Filters</h3> */}
        <Button variant='outline' onClick={handleReset} className='gap-2'>
          <RotateCcw className='w-4 h-4' />
          Reset
        </Button>
        <Button className='gap-2' onClick={() => setIsOpen(false)}>
          Apply
        </Button>
      </div>
    </div>
  );
}
