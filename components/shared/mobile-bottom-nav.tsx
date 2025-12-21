'use client';

import { Home, ShoppingBag, ShoppingCart, User, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { useGetPublicCategories } from '@/hooks';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const { fetchPublicCategoriesData, fetchPublicCategories } =
    useGetPublicCategories();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/new-drops', icon: Sparkles, label: 'New Drops' },
    {
      href: '#',
      icon: ShoppingBag,
      label: 'Shop',
      action: () => setIsShopOpen(true),
    },
    { href: '/custom-products', icon: ShoppingCart, label: 'Custom' },
    { href: '/my-profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      <nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700'>
        <div className='grid grid-cols-5 h-16'>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 transition-colors',
                    isActive
                      ? 'text-orange-500'
                      : 'text-gray-600 hover:text-orange-500 dark:text-gray-400'
                  )}
                >
                  <Icon className='w-5 h-5' />
                  <span className='text-xs font-medium'>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-colors',
                  isActive
                    ? 'text-orange-500'
                    : 'text-gray-600 hover:text-orange-500 dark:text-gray-400'
                )}
              >
                <Icon className='w-5 h-5' />
                <span className='text-xs font-medium'>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Shop Categories Sheet */}
      <Sheet open={isShopOpen} onOpenChange={setIsShopOpen}>
        <SheetContent side='bottom' className='h-[60vh] rounded-t-3xl'>
          <SheetHeader>
            <SheetTitle className='text-center'>Shop Categories</SheetTitle>
          </SheetHeader>
          <div className='mt-6 overflow-y-auto max-h-[calc(60vh-80px)]'>
            {fetchPublicCategories.isLoading ? (
              <div className='space-y-3 px-4'>
                <div className='h-12 bg-gray-200 rounded-lg animate-pulse' />
                <div className='h-12 bg-gray-200 rounded-lg animate-pulse' />
                <div className='h-12 bg-gray-200 rounded-lg animate-pulse' />
                <div className='h-12 bg-gray-200 rounded-lg animate-pulse' />
              </div>
            ) : (
              <div className='space-y-2 px-4'>
                {fetchPublicCategoriesData?.data?.map((category) => (
                  <Link
                    key={category.id}
                    href={`/new-drops?page=1&category=${category.slug}`}
                    onClick={() => setIsShopOpen(false)}
                    className='block w-full rounded-xl px-4 py-4 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition border border-gray-200'
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add padding to prevent content from being hidden behind bottom nav */}
      <div className='md:hidden h-16' />
    </>
  );
}
