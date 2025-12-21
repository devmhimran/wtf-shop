'use client';

import { SizeType } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';
import { useSizes } from '@/hooks';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertModal, ConfirmModal } from '@/components/shared';
import { UpdateSizesForm } from '@/components/forms';

type SizesCardProps = {
  data?: SizeType[];
};

export function SizesCard({ data }: SizesCardProps) {
  const [isPending, setIsPending] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [sizeDetails, setSizeDetails] = useState<SizeType | null>(null);
  const [sizeId, setSizeId] = useState<number | null>(null);
  const { deleteSizeAsync } = useSizes();

  const handleDeleteSize = () => {
    setIsPending(true);
    if (!sizeId) return;
    toast.promise(deleteSizeAsync(sizeId), {
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

  const handleEditSize = (size: SizeType) => {
    setSizeDetails(size);
    setOpenUpdateModal(true);
  };

  if (!data || data.length === 0) {
    return (
      <div className='text-center py-10 text-muted-foreground'>
        No Sizes found
      </div>
    );
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-80px'>Serial</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className='text-end'>Options</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((size, index) => (
            <TableRow key={size.id} className='hover:bg-muted/50 '>
              <TableCell className='font-medium text-primary text-base'>
                {index + 1}.
              </TableCell>
              <TableCell className='font-medium text-base'>
                {size.name}
              </TableCell>
              <TableCell className='text-end'>
                <DropdownMenu>
                  <DropdownMenuTrigger className='cursor-pointer'>
                    <EllipsisVertical className='w-4 h-4' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='font-inter'>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditSize(size)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-red-500'
                      onClick={() => {
                        setSizeId(+size.id);
                        setConfirmModal(true);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
        <UpdateSizesForm setIsOpen={setOpenUpdateModal} data={sizeDetails} />
      </AlertModal>
    </div>
  );
}
