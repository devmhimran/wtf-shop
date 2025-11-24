'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  EllipsisVertical,
  Eye,
  Plus,
  Search,
  UserX,
  X,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  generateQueryString,
  roleConvert,
  userStatusConvert,
} from '@/lib/utils';
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
import { UsersTable } from '@/components/pages/users';
import { useAdminUsers } from '@/hooks/use-admin-users';
import { AlertModal, Modal } from '@/components/shared';
import { UsersTableSkeleton } from '@/components/skeletons';

export default function UsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  );
  const [roleFilter, setRoleFilter] = useState(
    searchParams.get('role') || 'all'
  );

  const [params, setParams] = useState({
    search: searchParams.get('search') || '',
    page: searchParams.get('page') || '1',
    status: searchParams.get('status') || '',
    role: searchParams.get('role') || '',
  });

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  const queryString = generateQueryString(params);
  const { fetchAdminUsersData, fetchAdminUsersMutation } =
    useAdminUsers(queryString);

  const debounced = useDebouncedCallback((value) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: value,
      page: '1',
    }));
  }, 500);

  useEffect(() => {
    router.push(queryString);
  }, [queryString, router]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>Users</h1>
        <Button onClick={() => setAddUserOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Create User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by name, email, or phone...'
                value={searchQuery}
                onChange={(e) => {
                  debounced(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className='pl-8'
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  status: value === 'all' ? '' : value,
                }));
                setStatusFilter(value);
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='ACTIVE'>Active</SelectItem>
                <SelectItem value='INACTIVE'>Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setParams((prev) => ({
                  ...prev,
                  role: value === 'all' ? '' : value,
                }));
                setRoleFilter(value);
              }}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filter by role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='ADMIN'>Admin</SelectItem>
                <SelectItem value='SUPER_ADMIN'>Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex flex-wrap gap-2'>
            {params.search && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm'>
                {params.search}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      search: '',
                    }));
                    setSearchQuery('');
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.status && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Status:{' '}
                {
                  userStatusConvert[
                    params.status as keyof typeof userStatusConvert
                  ]
                }
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      status: '',
                    }));
                    setStatusFilter('all');
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
            {params.role && (
              <div className='pl-3 pr-2 py-1 border flex gap-2 items-center rounded-full text-sm capitalize'>
                Role: {roleConvert[params.role as keyof typeof roleConvert]}
                <span
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      role: '',
                    }));
                    setRoleFilter('all');
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          {!fetchAdminUsersMutation.isLoading ? (
            <div className='hidden md:block'>
              <UsersTable data={fetchAdminUsersData?.data || []} />
            </div>
          ) : (
            <UsersTableSkeleton />
          )}

          {fetchAdminUsersData && fetchAdminUsersData.meta.count > 0 && (
            <div className='flex md:flex-row flex-col items-center md:justify-between justify-center gap-3 py-4'>
              <div className='text-sm text-muted-foreground'>
                {fetchAdminUsersData &&
                  ` Showing ${params.page} to ${
                    fetchAdminUsersData.meta.page *
                    fetchAdminUsersData.data.length
                  } of ${fetchAdminUsersData.meta.count} results`}
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setParams((prev) => ({
                      ...prev,
                      page: (+params.page - 1).toString(),
                    }))
                  }
                  disabled={+params.page === 1}
                >
                  <ChevronLeft className='h-4 w-4' />
                  Previous
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setParams((prev) => ({
                      ...prev,
                      page: (+params.page + 1).toString(),
                    }))
                  }
                  disabled={
                    +params.page ===
                    (fetchAdminUsersData && fetchAdminUsersData.meta.totalPages)
                  }
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* <AlertModal
        isOpen={addUserOpen}
        setIsOpen={setAddUserOpen}
        title='Create new user'
        description=' '
      >
        <AddUserForm setIsOpen={setAddUserOpen} />
      </AlertModal>
      <AlertModal
        isOpen={createUserPaymentOpen}
        setIsOpen={setCreateUserPaymentOpen}
        title='Create new user payment'
        description=' '
      >
        <CreateUserPaymentForm
          setIsOpen={setCreateUserPaymentOpen}
          userId={paymentUserId}
          salary={salary}
        />
      </AlertModal>
      <AlertModal
        isOpen={updateUserModal}
        setIsOpen={setUpdateUserModal}
        title='Update user'
        description=' '
      >
        <UpdateUserForm setIsOpen={setUpdateUserModal} data={updateUser} />
      </AlertModal>
      <Modal
        isOpen={viewUserModal}
        setIsOpen={setViewUserModal}
        title='User Details'
        description=' '
      >
        {viewUser && <UserDetailsView user={viewUser} />}
      </Modal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your user '
        onClick={handleDeleUser}
      /> */}
    </div>
  );
}
