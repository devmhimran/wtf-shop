'use client';

import dayjs from 'dayjs';
import { Edit, EllipsisVertical, Eye, UserX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { UsersTableSkeleton } from '@/components/skeletons';
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
import { Badge } from '@/components/ui/badge';
import { AlertModal, ConfirmModal } from '@/components/shared';
import { useAdminUsersMutation } from '@/hooks/use-admin-users';

import { useUser } from '@/hooks';

import { UpdateCustomerForm } from '@/components/forms';
import { CustomersType } from '@/types';
import { CustomerDetails } from './customer-details';

type CustomerTableProps = {
  data?: CustomersType[];
  loading?: boolean;
};

export function CustomerTable({ data, loading }: CustomerTableProps) {
  const { fetchMe } = useUser();
  const [userId, setUserId] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<CustomersType | null>(null);
  const [openUserDetails, setOpenUserDetails] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { deleteUserAsync } = useAdminUsersMutation();

  const handleDeleteUser = () => {
    setIsPending(true);
    if (!userId) return;
    toast.promise(deleteUserAsync(userId), {
      loading: 'Deleting user...',
      success: () => {
        setConfirmModal(false);
        setIsPending(false);
        return 'Successfully user deleted';
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

  const handleViewUser = (user: CustomersType) => {
    setUserDetails(user);
    setOpenUserDetails(true);
  };

  const handleEditUser = (user: CustomersType) => {
    setUserDetails(user);
    setOpenUpdateModal(true);
  };

  return loading ? (
    <UsersTableSkeleton />
  ) : (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Serial</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined At</TableHead>
          <TableHead className='text-center'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data &&
          data.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className='font-medium'>{user.name}</TableCell>
              <TableCell className='font-medium'>{user.email}</TableCell>

              <TableCell>
                {user.isActive ? (
                  <Badge variant='secondary'>Active</Badge>
                ) : (
                  <Badge variant='destructive'>Inactive</Badge>
                )}
              </TableCell>
              <TableCell>
                {dayjs(user.createdAt).format('DD-MM-YYYY')}
              </TableCell>
              <TableCell className='flex gap-2 justify-center'>
                <DropdownMenu>
                  <DropdownMenuTrigger className='p-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer'>
                    <EllipsisVertical className='w-5 h-5 text-gray-600' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => handleViewUser(user)}>
                      <Eye className='mr-2 h-4 w-4' />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={isPending || fetchMe?.id === user.id}
                      onClick={() => {
                        setConfirmModal(true);
                        setUserId(user.id);
                      }}
                      className='text-red-600'
                    >
                      <UserX className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>

      <AlertModal
        isOpen={openUpdateModal}
        setIsOpen={setOpenUpdateModal}
        title='Update Customer Details'
        description=' '
      >
        <UpdateCustomerForm setIsOpen={setOpenUpdateModal} data={userDetails} />
      </AlertModal>

      <AlertModal
        isOpen={openUserDetails}
        setIsOpen={setOpenUserDetails}
        title='View Customer Details'
        description=' '
      >
        <CustomerDetails data={userDetails} />
      </AlertModal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your customer '
        onClick={handleDeleteUser}
      />
    </Table>
  );
}
