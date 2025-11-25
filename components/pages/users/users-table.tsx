'use client';

import dayjs from 'dayjs';
import { Edit, EllipsisVertical, Eye, UserX } from 'lucide-react';
import { useState } from 'react';

import { UsersTableSkeleton } from '@/components/skeletons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { roleConvert } from '@/lib/utils';
import { UsersType } from '@/types/users.types';
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
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks';
import { Button } from '@/components/ui/button';
import { UserDetails } from './user-details';

type UsersTableProps = {
  data?: UsersType[];
  loading?: boolean;
};

export function UsersTable({ data, loading }: UsersTableProps) {
  const { fetchMe } = useUser();
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<UsersType | null>(null);
  const [openUserDetails, setOpenUserDetails] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { deleteUserAsync } = useAdminUsersMutation();

  const handleDeleUser = () => {
    setIsPending(true);
    if (!userId) return;
    toast.promise(deleteUserAsync(userId), {
      loading: 'Deleting user...',
      success: () => {
        setConfirmModal(false);
        setIsPending(false);
        router.push('/dashboard/users');
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

  const handleViewUser = (user: UsersType) => {
    setUserDetails(user);
    setOpenUserDetails(true);
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
          <TableHead>Role</TableHead>
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
              <TableCell className='capitalize'>
                {roleConvert[user.role as keyof typeof roleConvert]}
              </TableCell>
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
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant='outline'>
                        <EllipsisVertical className='w-5 h-5 text-gray-600' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={() => handleViewUser(user)}>
                        <Eye className='mr-2 h-4 w-4' />
                        Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                      // onClick={() => handleEditUser(user)}
                      >
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
              </TableCell>
            </TableRow>
          ))}
      </TableBody>

      <AlertModal
        isOpen={openUserDetails}
        setIsOpen={setOpenUserDetails}
        title='View User Details'
        description=' '
      >
        <UserDetails data={userDetails} />
      </AlertModal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your user '
        onClick={handleDeleUser}
      />
    </Table>
  );
}
