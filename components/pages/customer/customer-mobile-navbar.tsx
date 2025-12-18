'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authLogout } from '@/lib/utils';
import { Package, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

const sidebarItems = [
  { label: 'My Orders', href: '/c/my-orders', icon: Package },
  { label: 'Profile', href: '/c/profile', icon: User },
];

export function CustomerMobileNavbar() {
  const router = useRouter();

  const handleValueChange = (value: string) => {
    if (value === 'logout') {
      authLogout();
    } else {
      router.push(value);
    }
  };

  return (
    <Select defaultValue='/c/my-orders' onValueChange={handleValueChange}>
      <SelectTrigger className='w-full'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {sidebarItems.map((item) => (
            <SelectItem key={item.href} value={item.href}>
              {item.label}
            </SelectItem>
          ))}

          <SelectItem value='logout' className='text-red-600'>
            Logout
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
