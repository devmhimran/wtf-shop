'use client';

import { ShippingChargeType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical, Package, DollarSign, Truck } from 'lucide-react';
import { shippingRegionConvert } from '@/lib/utils';
import { AlertModal, ConfirmModal } from '@/components/shared';
import { useState } from 'react';
import { useShippingCharge } from '@/hooks';
import { toast } from 'sonner';
import { UpdateShippingChargeForm } from '@/components/forms';

export function ShippingChargeCard({ data }: { data?: ShippingChargeType[] }) {
  const [isPending, setIsPending] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [shippingChargeId, setShippingChargeId] = useState<number | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [shippingChargeDetails, setShippingChargeDetails] =
    useState<ShippingChargeType | null>(null);

  const { deleteShippingChargeAsync } = useShippingCharge();

  const handleDeleteSize = () => {
    setIsPending(true);
    if (!shippingChargeId) return;
    toast.promise(deleteShippingChargeAsync(shippingChargeId), {
      loading: 'Deleting size...',
      success: () => {
        setConfirmModal(false);
        setIsPending(false);
        return 'Successfully size deleted';
      },
      error: (error) => {
        setIsPending(false);
        return (
          error?.response?.data?.error ||
          error.message ||
          'Failed to delete size'
        );
      },
    });
  };

  const handleEditShippingCharge = (charge: ShippingChargeType) => {
    setShippingChargeDetails(charge);
    setOpenUpdateModal(true);
  };

  if (!data || data.length === 0) {
    return (
      <div className='text-center py-10 text-muted-foreground'>
        No shipping charges found
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
      {data.map((charge) => (
        <Card key={charge.id} className='hover:shadow-md transition-shadow'>
          <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-3'>
            <div className='space-y-1'>
              <CardTitle className='text-lg font-semibold'>
                {charge.region === 'INSIDE_AU' ? 'Inside AU' : 'Outside AU'}
              </CardTitle>
              <Badge
                variant={
                  charge.region === 'INSIDE_AU' ? 'default' : 'secondary'
                }
              >
                {
                  shippingRegionConvert[
                    charge.region as keyof typeof shippingRegionConvert
                  ]
                }
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className='cursor-pointer'>
                <EllipsisVertical className='w-5 h-5 text-muted-foreground' />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='font-inter'>
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleEditShippingCharge(charge)}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='text-red-500'
                  onClick={() => {
                    setShippingChargeId(charge.id);
                    setConfirmModal(true);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Package className='w-4 h-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Quantity Range:</span>
              <span className='font-medium ml-auto'>
                {charge.minQty} - {charge.maxQty ?? '∞'}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <DollarSign className='w-4 h-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Base Charge:</span>
              <span className='font-semibold ml-auto'>
                AU${charge.baseCharge.toFixed(2)}
              </span>
            </div>
            {charge.additionalChargePerItem > 0 && (
              <div className='flex items-center gap-2'>
                <DollarSign className='w-4 h-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Additional/Item:</span>
                <span className='font-medium ml-auto'>
                  AU${charge.additionalChargePerItem.toFixed(2)}
                </span>
              </div>
            )}
            <div className='flex items-center gap-2 pt-2 border-t'>
              <Truck className='w-4 h-4 text-muted-foreground' />
              <span className='text-muted-foreground'>Free Shipping:</span>
              <Badge
                variant={charge.freeShipping ? 'default' : 'outline'}
                className='ml-auto'
              >
                {charge.freeShipping ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your size'
        onClick={handleDeleteSize}
      />

      <AlertModal
        isOpen={openUpdateModal}
        setIsOpen={setOpenUpdateModal}
        title='Edit category'
        description=' '
      >
        <UpdateShippingChargeForm
          setIsOpen={setOpenUpdateModal}
          data={shippingChargeDetails}
        />
      </AlertModal>
    </div>
  );
}
