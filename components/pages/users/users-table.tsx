'use client';

import dayjs from 'dayjs';

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
import { Edit, EllipsisVertical, Eye, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type UsersTableProps = {
  data?: UsersType[];
  loading?: boolean;
};

export function UsersTable({ data, loading }: UsersTableProps) {
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
                      <EllipsisVertical className='w-5 h-5 text-gray-600' />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                      // onClick={() => handleViewUser(user)}
                      >
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
                        onClick={() => {
                          // setConfirmModal(true);
                          // setUserId(user.id);
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
    </Table>
  );
}
