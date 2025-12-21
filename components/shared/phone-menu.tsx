'use client';

import Link from 'next/link';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { useGetPublicCategories } from '@/hooks';

type PhoneMenuProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function PhoneMenu({ isOpen, setIsOpen }: PhoneMenuProps) {
  const { fetchPublicCategoriesData, fetchPublicCategories } =
    useGetPublicCategories();
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side='top' className='py-3 gap-0'>
        <SheetHeader>
          <SheetTitle>
            <span onClick={() => setIsOpen(false)}>
              <Link href='/'>
                <Image
                  src='/assets/png/what-the-funk.png'
                  width={120}
                  height={80}
                  alt='Logo Main'
                  className={cn('w-14 inline')}
                />
              </Link>
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav>
          <ul className=''>
            <li>
              <SheetClose asChild>
                <Link
                  href='/new-drops'
                  className='block w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-white/5 transition'
                >
                  New Drops
                </Link>
              </SheetClose>
            </li>

            <li>
              {/* <SheetClose> */}
              <Accordion type='single' collapsible>
                <AccordionItem value='item-1'>
                  <AccordionTrigger
                    className='flex justify-start gap-4 w-full rounded-xl px-4 py-3 text-sm font-medium 
                  text-gray-700 hover:bg-white/5 transition'
                  >
                    Shop
                  </AccordionTrigger>
                  {fetchPublicCategories.isLoading
                    ? null
                    : fetchPublicCategoriesData?.data.map((category) => (
                        <AccordionContent key={category.id}>
                          <SheetClose asChild>
                            <Link
                              href={`/new-drops?page=1&category=${category.slug}`}
                              className='block w-full rounded-xl px-8 py-1 text-sm font-medium text-gray-700
                                hover:bg-white/5 transition'
                            >
                              {category.name}
                            </Link>
                          </SheetClose>
                        </AccordionContent>
                      ))}
                </AccordionItem>
              </Accordion>
              {/* <Link
                  href='/products'
                  className='block w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-700 
                  hover:bg-white/5 transition'
                >
                  Shop
                </Link> */}
              {/* </SheetClose> */}
            </li>

            <li>
              <SheetClose asChild>
                <Link
                  href='/custom-products'
                  className='block w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-white/5 transition'
                >
                  Custom Products
                </Link>
              </SheetClose>
            </li>
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
