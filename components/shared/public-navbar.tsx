'use client';

import { ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu';
import { useGetPublicCategories, useUser } from '@/hooks';
import { authLogout, cn } from '@/lib/utils';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { useCartStore } from '@/store/useCart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function PublicNavbar() {
  const { fetchMe } = useUser();
  const { fetchPublicCategoriesData, fetchPublicCategories } =
    useGetPublicCategories();
  const { items } = useCartStore();

  return (
    <div
      className='sticky top-0 z-50 -mb-20 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 
    dark:border-slate-50/6 bg-white/50 supports-backdrop-blur:bg-white/65 dark:bg-transparent'
    >
      <div className='max-w-screen-2xl flex justify-between items-center mx-auto py-2 px-2'>
        <Link href='/'>
          <Image
            src='/assets/png/what-the-funk.png'
            width={140}
            height={100}
            alt='Logo Main'
            className={cn('w-16 inline')}
          />
        </Link>

        <div className='hidden md:block'>
          <div className='flex items-center justify-center gap-10'>
            <Link href='/new-drops' className='hover:text-[#FF4C01]'>
              New Drops
            </Link>
            <div className='hover:text-[#FF4C01]'>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className='cursor-pointer text-lg p-0 font-normal bg-transparent hover:bg-transparent focus:bg-transparent 
                        data-[state=open]:hover:bg-transparent
                        data-[state=open]:focus:bg-transparent data-[state=open]:bg-transparent 
                         data-[state=open]:hover:text-orange-500 data-[state=open]:focus:text-orange-500
                        hover:text-orange-500 focus:text-orange-500'
                    >
                      Shop
                    </NavigationMenuTrigger>
                    {fetchPublicCategories.isLoading ? (
                      <NavigationMenuContent>
                        <div className='w-[300px] p-4 space-y-3'>
                          <Skeleton className='h-8 w-full' />
                          <Skeleton className='h-8 w-full' />
                          <Skeleton className='h-8 w-full' />
                          <Skeleton className='h-8 w-full' />
                        </div>
                      </NavigationMenuContent>
                    ) : (
                      <NavigationMenuContent>
                        {fetchPublicCategoriesData?.data?.map((category) => (
                          <Link
                            href={`/new-drops?page=1&category=${category.slug}`}
                            key={category.id}
                          >
                            <NavigationMenuLink className='w-[300px] block px-4 py-2 hover:bg-accent hover:text-accent-foreground'>
                              {category.name}
                            </NavigationMenuLink>
                          </Link>
                        ))}
                      </NavigationMenuContent>
                    )}
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <Link href='/custom-products' className='hover:text-[#FF4C01]'>
              Custom Products
            </Link>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <Link href='/cart' className='relative'>
            {items.length > 0 && (
              <div className='w-2 h-2 rounded-full bg-orange-500 absolute top-0 -right-1'></div>
            )}

            <ShoppingCart />
          </Link>
          <div className='hidden md:block'>
            {fetchMe?.id ? (
              <DropdownMenu>
                <DropdownMenuTrigger className='cursor-pointer px-2'>
                  <User />
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-44 font-oswald'>
                  <DropdownMenuLabel>
                    {fetchMe?.name || 'User'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href='/c/my-orders'>My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href='/c/profile'>My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => authLogout()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href='/signin' className='hover:text-[#FF4C01]'>
                Sign In
              </Link>
            )}
          </div>
          {/* <span className='md:hidden block'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setIsOpen(true)}
            >
              <Menu />
            </Button>
          </span> */}
        </div>
        {/* <PhoneMenu isOpen={isOpen} setIsOpen={setIsOpen} /> */}
      </div>
    </div>
  );
}
