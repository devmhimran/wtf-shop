'use client';

import { useSession } from 'next-auth/react';
import {
  Users,
  LayoutDashboard,
  ListOrdered,
  List,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

import { UserNav } from './user-nav';
import { PrimaryLogo } from './primary-logo';

const superAdminMenuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard/',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    url: '/dashboard/products',
    icon: ListOrdered,
  },
  {
    title: 'Custom Products',
    url: '/dashboard/custom-products',
    icon: List,
  },
  {
    title: 'Orders',
    url: '/dashboard/orders',
    icon: Package,
  },
  {
    title: 'Customers',
    url: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: Users,
  },
];

const adminMenuItems = [
  {
    title: 'Products',
    url: '/dashboard/products',
    icon: ListOrdered,
  },
  {
    title: 'Custom Products',
    url: '/dashboard/custom-products',
    icon: List,
  },
  {
    title: 'Orders',
    url: '/dashboard/orders',
    icon: Package,
  },
];

const MenuSkeleton = () => (
  <SidebarGroup>
    <SidebarGroupLabel>
      <Skeleton className='h-4 w-20 bg-gray-300 dark:bg-gray-600' />
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {Array.from({ length: 3 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton className=''>
              <Skeleton className='h-4 w-4 bg-gray-300 dark:bg-gray-600' />
              <Skeleton className='h-4 w-16 bg-gray-300 dark:bg-gray-600' />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

export function AppSidebar() {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;
  const pathname = usePathname();

  // Loading skeleton component for menu items

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href='/dashboard'
          className='flex items-center gap-2 px-4 py-2 hover:bg-sidebar-accent rounded-md'
        >
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
            <PrimaryLogo link='/dashboard/' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>Whatthefunk</span>
            <span className='truncate text-xs text-sidebar-foreground/70'>
              Ecommerce Admin
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {status === 'loading' ? (
          <MenuSkeleton />
        ) : (
          <>
            {userRole === 'SUPER_ADMIN' && (
              <SidebarGroup>
                <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {superAdminMenuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {userRole === 'ADMIN' && (
              <SidebarGroup>
                <SidebarGroupLabel>
                  {userRole === 'ADMIN' ? 'User Panel' : 'My Dashboard'}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminMenuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
