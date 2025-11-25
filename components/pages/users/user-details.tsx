import dayjs from 'dayjs';

import { UsersType } from '@/types';
import { DetailItems } from '@/components/shared';

type UserDetailsProps = {
  data: UsersType | null;
};

export function UserDetails({ data }: UserDetailsProps) {
  if (!data) {
    return (
      <div className='flex items-center justify-center py-10'>
        <p className='text-muted-foreground'>No user data available</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-4'>
        <DetailItems label='Name' value={data.name} copyable />
        <DetailItems label='Email' value={data.email} copyable />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <DetailItems
          label='Role'
          value={data.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Co-Admin'}
        />
        <div className='space-y-2'>
          <label className='text-sm text-muted-foreground'>Status</label>
          <div className='rounded-lg border bg-muted/50 px-4 py-3'>
            <div
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                data.isActive
                  ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                  : 'bg-red-500/20 text-red-700 dark:text-red-400'
              }`}
            >
              {data.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <DetailItems
          label='Joined At'
          value={dayjs(data.createdAt).format('DD-MM-YYYY')}
          copyable
        />
        <DetailItems
          label='Updated At'
          value={dayjs(data.updatedAt).format('DD-MM-YYYY')}
          copyable
        />
      </div>
    </div>
  );
}
