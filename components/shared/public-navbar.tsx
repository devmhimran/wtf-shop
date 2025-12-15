'use client';

import {
  Menu,
  ShoppingCart,
  X,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../ui/navigation-menu';
import { useGetPublicCategories, useUser } from '@/hooks';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { authLogout } from '@/lib/utils';

export function PublicNavbar() {
  const { fetchMe } = useUser();

  const [bgColor, setBgColor] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dropDownOpen, setDropDownOpen] = useState(false);

  const [customIsOpen, setCustomIsOpen] = useState(false);

  const { fetchPublicCategoriesData, fetchPublicCategories } =
    useGetPublicCategories();

  //   const cart = useSelector((state: any) => state.cart.products);
  const [cartLength, setCartLength] = useState(false);
  //   const { data: session }: { data: any } = useSession();
  //   const userId = session?.user?.user?.id;

  // const { data: categories, isLoading }: { data: any; isLoading: boolean } =
  //   useQuery({
  //     queryKey: ['categories'],
  //     queryFn: () => categoryApi.categories().then(({ data }) => data),
  //   });

  //   const {
  //     data: categoriesWithoutCustom,
  //     isLoading: isLoadingCategoryWithoutCustom,
  //   }: { data: any; isLoading: boolean } = useQuery({
  //     queryKey: ['categoriesWithoutCustom'],
  //     queryFn: () => categoryApi.withoutCustom().then(({ data }) => data),
  //   });

  //   const {
  //     data: categoriesWithCustom,
  //     isLoading: isLoadingCategoryWithCustom,
  //   }: { data: any; isLoading: boolean } = useQuery({
  //     queryKey: ['categoriesWithCustom'],
  //     queryFn: () => categoryApi.withCustom().then(({ data }) => data),
  //   });

  const handleScroll = () => {
    if (window.scrollY > 10) {
      setBgColor('#e4e2e2');
    } else {
      setBgColor('');
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  //   useEffect(() => {
  //     setCartLength(cart.length > 0 ? true : false);
  //   }, [cart]);

  return (
    <div className='sticky top-0 z-50 -mb-20 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/50 supports-backdrop-blur:bg-white/65 dark:bg-transparent'>
      <div className='max-w-8xl mx-auto'>
        <div className='relative border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10 px-4 lg:mx-0'>
          <div className='flex items-center'>
            <div>
              <Link href='/'>
                <img
                  width={80}
                  height={50}
                  src='/assets/png/what-the-funk.png'
                  alt='what-the-funk-logo'
                />
              </Link>
            </div>
            {/* desktop menu */}
            <div className='hidden lg:flex items-center ml-auto'>
              <ul className='flex items-center text-lg'>
                {/* <li className='py-5 px-8'>
                    <Link
                      href={`/collections/new-drops?page=1&filter=${customCategory?.attributes.category_slug}`}
                    >
                      Custom Products
                    </Link>
                  </li> */}

                <li className='py-5 px-8'>
                  <Link href='/new-drops'>New Drops</Link>
                </li>
                <li className='py-5 px-8'>
                  {/* <Link href='/custom-products'>Shop</Link> */}
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger
                          className='cursor-pointer text-lg p-0 font-normal bg-transparent hover:bg-transparent focus:bg-transparent 
                        data-[state=open]:hover:bg-transparent
                        data-[state=open]:focus:bg-transparent data-[state=open]:bg-transparent'
                        >
                          Shop
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          {fetchPublicCategoriesData?.data?.map((category) => (
                            <Link
                              href={`/new-drops?page=1&category=${category.slug}`}
                              key={category.id}
                            >
                              <NavigationMenuLink className='w-[300px]'>
                                {category.name}
                              </NavigationMenuLink>
                            </Link>
                          ))}
                          {/* <NavigationMenuLink>Link</NavigationMenuLink> */}
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </li>
                <li className='py-5 px-8'>
                  <Link href='/custom-products'>Custom Products</Link>
                </li>

                {/* {categoriesWithoutCustom?.data &&
                    categoriesWithoutCustom.data.length > 0 && (
                      <li className='py-5 px-8 cursor-pointer relative group'>
                        <div
                          className='cursor-pointer'
                          onMouseEnter={() => setIsShopOpen(true)}
                          onMouseLeave={() => setIsShopOpen(false)}
                        >
                          Shop
                        </div>

                   
                        <div
                          className={`absolute top-14 left-0 mt-1 bg-white shadow-lg border rounded-md min-w-[200px] z-50 transition-all duration-200 ${
                            isShopOpen
                              ? 'opacity-100 visible'
                              : 'opacity-0 invisible'
                          }`}
                          onMouseEnter={() => setIsShopOpen(true)}
                          onMouseLeave={() => setIsShopOpen(false)}
                        >
                          {categoriesWithoutCustom.data.map(
                            (component: any) => (
                              <Link
                                key={component.attributes.title}
                                href={`/collections/new-drops?page=1&filter=${component.attributes.category_slug}`}
                                className='block px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-md last:rounded-b-md'
                                onClick={() => setIsShopOpen(false)}
                              >
                                {component.attributes.title}
                              </Link>
                            )
                          )}
                        </div>
                      </li>
                    )} */}
                {/* {categoriesWithCustom?.data &&
                    categoriesWithCustom.data.length > 0 && (
                      <li className='py-5 px-8 cursor-pointer relative group'>
                        <div
                          className='cursor-pointer'
                          onMouseEnter={() => setCustomIsOpen(true)}
                          onMouseLeave={() => setCustomIsOpen(false)}
                        >
                          Custom Products
                        </div>

                        
                        <div
                          className={`absolute top-14 left-0 mt-1 bg-white shadow-lg border rounded-md min-w-[200px] z-50 transition-all duration-200 ${
                            customIsOpen
                              ? 'opacity-100 visible'
                              : 'opacity-0 invisible'
                          }`}
                          onMouseEnter={() => setCustomIsOpen(true)}
                          onMouseLeave={() => setCustomIsOpen(false)}
                        >
                          {categoriesWithCustom.data.map((component: any) => (
                            <Link
                              key={component.attributes.title}
                              href={`/collections/new-drops?page=1&filter=${component.attributes.category_slug}`}
                              className='block px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-md last:rounded-b-md'
                              onClick={() => setCustomIsOpen(false)}
                            >
                              {component.attributes.title}
                            </Link>
                          ))}
                        </div>
                      </li>
                    )} */}

                <li className='py-5 pl-8 flex items-center relative'>
                  <Link href='/cart' aria-label='Shopping cart'>
                    <div className='relative'>
                      {cartLength && (
                        <div
                          className=' absolute -top-1 -right-1 text-xs bg-orange-600 w-2 h-2 leading-none flex justify-center items-center rounded-full'
                          aria-label='Items in cart'
                        ></div>
                      )}
                      <ShoppingCart className='h-5 w-5' aria-hidden='true' />
                    </div>
                  </Link>
                </li>
                <li className='py-5 pl-8 flex items-center'>
                  {fetchMe?.role === 'CUSTOMER' ? (
                    <div className='cursor-pointer flex items-center'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          {/* <Button
                            variant='ghost'
                            className='h-0 p-0'
                            aria-label='User menu'
                          > */}
                          <div className='p-2'>
                            <User className='h-5 w-5' aria-hidden='true' />
                          </div>
                          {/* </Button> */}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className='w-32 bg-white'
                          align='end'
                        >
                          <Link href='/c/my-order'>
                            <DropdownMenuCheckboxItem className='cursor-pointer'>
                              My Orders
                            </DropdownMenuCheckboxItem>
                          </Link>
                          <DropdownMenuCheckboxItem
                            onClick={() => authLogout()}
                            className='cursor-pointer'
                          >
                            Sign out
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <Link href='/signin' aria-label='Login to your account'>
                      <User className='h-5 w-5' aria-hidden='true' />
                    </Link>
                  )}
                </li>
              </ul>
            </div>

            {/* mobile menu */}
            <div className='lg:hidden flex items-center gap-3 ml-auto'>
              {isOpen ? (
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label='Close navigation menu'
                  className='p-1'
                >
                  <X className='text-lg h-5 w-5' aria-hidden='true' />
                </button>
              ) : (
                <button
                  onClick={() => setIsOpen(true)}
                  aria-label='Open navigation menu'
                  className='p-1'
                >
                  <Menu className='text-lg h-5 w-5' aria-hidden='true' />
                </button>
              )}
              <Link href='/cart' aria-label='Shopping cart'>
                <div className='relative'>
                  {cartLength && (
                    <div
                      className='absolute top-0 -right-1 text-xs bg-orange-600 w-2 h-2 leading-none flex justify-center items-center rounded-full'
                      aria-label='Items in cart'
                    ></div>
                  )}
                  <ShoppingCart className='h-5 w-5' aria-hidden='true' />
                </div>
              </Link>
              <div className='py-5 flex items-center'>
                {/* {userId ? (
                  <div className='cursor-pointer flex items-center'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          className='h-0 p-0'
                          aria-label='User menu'
                        >
                          <User className='h-4 w-4' aria-hidden='true' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className='w-32 mt-6'>
                        <DropdownMenuCheckboxItem>
                          <Link href='/user/dashboard'>Dashboard</Link>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                        //   onClick={() => signOut()}
                        >
                          Sign out
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <Link href='/login' aria-label='Login to your account'>
                    <User className='h-4 w-4' aria-hidden='true' />
                  </Link>
                )} */}
              </div>
            </div>
          </div>
          {isOpen && (
            <div className='z-50 absolute top-0 left-0 w-full block lg:hidden'>
              <button
                className='block absolute top-6 right-10'
                onClick={() => {
                  setIsOpen(false);
                  setDropDownOpen(false);
                  setCustomIsOpen(false); // close custom dropdown too
                }}
                aria-label='Close navigation menu'
              >
                <X className='text-lg h-5 w-5' aria-hidden='true' />
              </button>
              <ul className='flex flex-col justify-center gap-8 w-full h-screen bg-white'>
                <li
                  className='text-center'
                  onClick={() => {
                    setIsOpen(false);
                    setDropDownOpen(false);
                    setCustomIsOpen(false);
                  }}
                >
                  <Link className='text-xl' href='/new-drops'>
                    New Drops
                  </Link>
                </li>
                {/* Shop Dropdown */}
                <li className='text-center text-xl cursor-pointer'>
                  <div
                    className='flex gap-3 justify-center items-center'
                    onClick={() => setDropDownOpen(!dropDownOpen)}
                  >
                    Shop
                    {dropDownOpen ? (
                      <ChevronUp className='h-5 w-5' />
                    ) : (
                      <ChevronDown className='h-5 w-5' />
                    )}
                  </div>
                  {fetchPublicCategories.isLoading ? (
                    <div className='text-sm mt-2'>Loading...</div>
                  ) : (
                    <ul
                      className={`transition-all duration-300 ease-in-out space-y-4 mt-4 ${
                        dropDownOpen ? 'block' : 'hidden'
                      }`}
                    >
                      {fetchPublicCategoriesData?.data?.map((category) => (
                        <li
                          key={category.id}
                          onClick={() => {
                            setIsOpen(false);
                            setDropDownOpen(false);
                          }}
                        >
                          <Link
                            className='text-center text-lg'
                            href={`/new-drops?page=1&category=${category.slug}`}
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
                {/* Custom Products */}
                <li
                  className='text-center'
                  onClick={() => {
                    setIsOpen(false);
                    setDropDownOpen(false);
                    setCustomIsOpen(false);
                  }}
                >
                  <Link className='text-xl' href='/custom-products'>
                    Custom Products
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* <Cart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} /> */}
    </div>
  );
}
