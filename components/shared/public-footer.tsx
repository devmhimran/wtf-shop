'use client';

import { Share2 } from 'lucide-react';
import Link from 'next/link';

export function PublicFooter() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // for smooth scrolling
    });
  };
  return (
    <div className='py-10 px-10 md:px-24 bg-[#313131]'>
      <div>
        <div className='flex md:flex-row flex-col justify-between pb-6 gap-4 items-center'>
          <div>
            <p className='uppercase text-white text-2xl md:text-start text-center'>
              Address
            </p>
            <p className='text-white font-regular md:text-start text-center'>
              54 John Street, <br />
              Lilydale Vic 3140 Australia
            </p>
          </div>
          <div>
            <p className='uppercase text-white text-2xl md:text-start text-center'>
              Opening hours
            </p>
            <p className='text-white font-regular md:text-start text-center'>
              by appointment only
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 text-white border-y-none md:border-y border-gray-600'>
          <div className='flex justify-center lg:justify-between border-r-none md:border-r gap-4 border-gray-600'>
            <div className='py-0 md:py-8 text-xl'>E-mail</div>
            <div className='p-0 md:p-8 text-xl lowercase'>
              whatthefunk.au@gmail.com
            </div>
          </div>
          <div className='flex items-center justify-center md:justify-end gap-4'>
            <div className='flex  divide-x divide-gray-600 border-gray-600 py-6 text-white'>
              <Link className='px-2 hover:underline' href='/contact'>
                Contact us
              </Link>
              <Link className='px-2 hover:underline' href='/about-us'>
                About us
              </Link>

              <Link
                className='px-2 hover:underline'
                href='/terms-and-conditions'
              >
                Terms and Conditions
              </Link>
              <Link className='px-2 hover:underline' href='/privacy-policy'>
                Privacy Policy
              </Link>
              <Link
                className='px-2 hover:underline'
                href='/returns-and-exchanges'
              >
                Returns and Exchanges
              </Link>
            </div>
          </div>
        </div>

        <div className='text-white pt-6'>
          <div className='flex flex-col md:flex-row justify-between gap-4 items-center'>
            <div
              className='uppercase flex items-center gap-2 cursor-pointer'
              onClick={scrollToTop}
            >
              Back to top <div className='w-7 h-[1.5px] bg-gray-200'></div>{' '}
            </div>
            <div>© Copyright - What the funk {new Date().getFullYear()}</div>
            <div>
              <Link
                className='flex gap-2 items-center'
                href='https://www.instagram.com/whatthefunk.au/'
              >
                <span className='text-xl'>Follow</span>
                <span>
                  <Share2 />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
