'use client';

import { ColorType } from '@/types';
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
import { useColors } from '@/hooks';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertModal, ConfirmModal } from '@/components/shared';
import { UpdateColorsForm } from '@/components/forms';

type ColorsCardProps = {
  data?: ColorType[];
};

export function ColorsCard({ data }: ColorsCardProps) {
  const [isPending, setIsPending] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [colorDetails, setColorDetails] = useState<ColorType | null>(null);
  const [colorId, setColorId] = useState<number | null>(null);
  const { deleteColorAsync } = useColors();

  const handleDeleteColor = () => {
    setIsPending(true);
    if (!colorId) return;
    toast.promise(deleteColorAsync(colorId), {
      loading: 'Deleting color...',
      success: () => {
        setConfirmModal(false);
        setIsPending(false);
        return 'Successfully color deleted';
      },
      error: (error) => {
        setIsPending(false);
        return (
          error?.response?.data?.error ||
          error.message ||
          'Failed to delete user'
        );
      },
    });
  };

  const handleEditColor = (color: ColorType) => {
    setColorDetails(color);
    setOpenUpdateModal(true);
  };

  if (!data || data.length === 0) {
    return (
      <div className='text-center py-10 text-muted-foreground'>
        No colors found
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
          {data.map((color, index) => (
            <TableRow key={color.id} className='hover:bg-muted/50 '>
              <TableCell className='font-medium text-muted-foreground'>
                {index + 1}
              </TableCell>
              <TableCell className='font-medium'>{color.name}</TableCell>
              {/* <TableCell>
                {color.hexCode ? (
                  <Badge variant='secondary' className='font-mono'>
                    {color.hexCode}
                  </Badge>
                ) : (
                  <span className='text-sm text-muted-foreground'>Not set</span>
                )}
              </TableCell> */}
              <TableCell className='text-end'>
                <DropdownMenu>
                  <DropdownMenuTrigger className='cursor-pointer'>
                    <EllipsisVertical className='w-4 h-4' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='font-inter'>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditColor(color)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-red-500'
                      onClick={() => {
                        setColorId(+color.id);
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
        title='This action cannot be undone. This will permanently delete your category'
        onClick={handleDeleteColor}
      />

      <AlertModal
        isOpen={openUpdateModal}
        setIsOpen={setOpenUpdateModal}
        title='Edit category'
        description=' '
      >
        <UpdateColorsForm setIsOpen={setOpenUpdateModal} data={colorDetails} />
      </AlertModal>
    </div>
  );
}
