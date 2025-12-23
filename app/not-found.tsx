'use client';

import { Button } from '@/components/ui/button';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen flex justify-center items-center'>
      <div>
        <h1 className='text-center text-2xl'>Oops...</h1>
        <p className='text-center text-lg'>You are lost</p>
        <img
          src='/assets/img/what-the-funk-logo-error.png'
          alt='404'
          width={450}
          height={450}
          decoding='async'
          loading='lazy'
        />

        <div className='flex justify-center mt-6'>
          <Link href='/'>
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
