'use client';

import { Card, CardContent } from '@/components/ui/card';
import { authLogout, cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  { label: 'My Orders', href: '/c/my-orders' },
  { label: 'Profile', href: '/c/profile' },
];

export function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <Card className='py-5 sticky top-26 '>
      <CardContent className='flex flex-col gap-4 px-4'>
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              pathname === item.href
                ? 'bg-orange-400 text-white'
                : 'hover:bg-gray-100 text-dark',
              ' py-2 px-3 rounded-md block'
            )}
          >
            {item.label}
          </Link>
        ))}
        <div
          className={cn(
            'hover:bg-gray-100 py-2 px-3 rounded-md block cursor-pointer'
          )}
          onClick={() => authLogout()}
        >
          Logout
        </div>
      </CardContent>
    </Card>
  );
}
