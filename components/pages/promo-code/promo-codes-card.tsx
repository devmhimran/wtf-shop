'use client';

import { PromoCodeType } from '@/types';
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
import {
  EllipsisVertical,
  Calendar,
  DollarSign,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { AlertModal, ConfirmModal } from '@/components/shared';
import { useState } from 'react';
import { usePromoCode } from '@/hooks/use-promo-code';
import { toast } from 'sonner';

export function PromoCodesCard({ data }: { data?: PromoCodeType[] }) {
  const [isPending, setIsPending] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [promoCodeId, setPromoCodeId] = useState<number | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [promoCodeDetails, setPromoCodeDetails] =
    useState<PromoCodeType | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { deletePromoCodeAsync } = usePromoCode();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeletePromoCode = () => {
    setIsPending(true);
    if (!promoCodeId) return;
    toast.promise(deletePromoCodeAsync(promoCodeId), {
      loading: 'Deleting promo code...',
      success: () => {
        setConfirmModal(false);
        setIsPending(false);
        return 'Successfully promo code deleted';
      },
      error: (error) => {
        setIsPending(false);
        return (
          error?.response?.data?.error ||
          error.message ||
          'Failed to delete promo code'
        );
      },
    });
  };

  const handleEditPromoCode = (promoCode: PromoCodeType) => {
    setPromoCodeDetails(promoCode);
    setOpenUpdateModal(true);
  };

  const isActive = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className='text-center py-10 text-muted-foreground'>
        No promo codes found
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      {data.map((promoCode) => {
        const active = isActive(promoCode.startDate, promoCode.endDate);
        const expired = new Date(promoCode.endDate) < new Date();

        return (
          <Card
            key={promoCode.id}
            className='hover:shadow-md transition-shadow'
          >
            <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-3'>
              <div className='space-y-2 flex-1'>
                <CardTitle className='text-lg font-semibold'>
                  {promoCode.title}
                </CardTitle>
                <Badge
                  variant={
                    active ? 'default' : expired ? 'destructive' : 'secondary'
                  }
                >
                  {active ? 'Active' : expired ? 'Expired' : 'Scheduled'}
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
                    onClick={() => handleEditPromoCode(promoCode)}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-red-500'
                    onClick={() => {
                      setPromoCodeId(promoCode.id);
                      setConfirmModal(true);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center gap-2 p-3 bg-muted rounded-lg border'>
                <span className='text-sm text-muted-foreground'>Code:</span>
                <code className='text-base font-mono font-semibold flex-1'>
                  {promoCode.code}
                </code>
                <button
                  onClick={() => handleCopyCode(promoCode.code)}
                  className='p-2 hover:bg-background rounded-md transition-colors'
                  title='Copy code'
                >
                  {copiedCode === promoCode.code ? (
                    <Check className='w-4 h-4 text-green-600' />
                  ) : (
                    <Copy className='w-4 h-4 text-muted-foreground' />
                  )}
                </button>
              </div>
              <div className='flex items-center gap-2'>
                <DollarSign className='w-4 h-4 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  Discount Amount:
                </span>
                <span className='text-sm font-semibold ml-auto'>
                  <span className='text-gray-600'>AU$</span>
                  {promoCode.amount}
                </span>
              </div>
              <div className='flex items-center gap-2 pt-2 border-t'>
                <Calendar className='w-4 h-4 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  Start Date:
                </span>
                <span className='text-sm font-medium ml-auto'>
                  {formatDateTime(promoCode.startDate)}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='w-4 h-4 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>End Date:</span>
                <span className='text-sm font-medium ml-auto'>
                  {formatDateTime(promoCode.endDate)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your promo code'
        onClick={handleDeletePromoCode}
      />

      <AlertModal
        isOpen={openUpdateModal}
        setIsOpen={setOpenUpdateModal}
        title='Edit Promo Code'
        description=' '
      >
        <div className='text-muted-foreground text-sm'>
          Update form coming soon
        </div>
      </AlertModal>
    </div>
  );
}
