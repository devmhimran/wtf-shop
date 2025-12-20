'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import {
  Mail,
  Calendar,
  EllipsisVertical,
  Eye,
  Edit,
  UserX,
} from 'lucide-react';

import { CustomersType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { UsersTableSkeleton } from '@/components/skeletons/users-table-skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks';
import { useAdminUsersMutation } from '@/hooks/use-admin-users';
import { AlertModal, ConfirmModal } from '@/components/shared';
import { UpdateCustomerForm } from '@/components/forms';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerDetails } from './customer-details';

type UsersCardProps = {
  data?: CustomersType[];
  loading?: boolean;
};

export function CustomerCard({ data, loading }: UsersCardProps) {
  const { fetchMe } = useUser();
  const [userId, setUserId] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<CustomersType | null>(null);
  const [openUserDetails, setOpenUserDetails] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

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
  if (loading) {
    return <UsersTableSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-10'>
          <p className='text-muted-foreground'>No users found</p>
        </CardContent>
      </Card>
    );
  }

  const handleViewUser = (user: CustomersType) => {
    setUserDetails(user);
    setOpenUserDetails(true);
  };

  const handleEditUser = (user: CustomersType) => {
    setUserDetails(user);
    setOpenUpdateModal(true);
  };

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {data.map((user) => {
        return (
          <div
            key={user.id}
            className='rounded-lg border bg-card text-card-foreground shadow-sm p-4'
          >
            <div className='flex justify-between gap-4 p-0'>
              <div className='text-sm'>
                <div className='text-lg text-wrap font-medium'>{user.name}</div>
              </div>
              <div className='self-start pl-1'>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <EllipsisVertical className='w-5 h-5 text-gray-700' />
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
              </div>
            </div>
            <div className='flex items-center gap-1 text-gray-600 text-sm mt-2'>
              <Mail className='h-3 w-3 self-start mt-1 shrink-0' />
              <div className='break-all text-wrap'>{user.email}</div>
            </div>
            <div className='space-y-3 p-0 mt-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <span>Status</span>
                </div>
                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className='flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t'>
                <Calendar className='h-3 w-3' />
                <span>
                  Joined{' '}
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your user '
        onClick={handleDeleteUser}
      />

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
    </div>
  );
}
