'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='max-w-2xl mx-auto text-center'>
        <div className='mb-8'>
          <CheckCircle className='mx-auto text-green-500' size={80} />
        </div>

        <h1 className='text-4xl font-bold mb-4'>Payment Successful!</h1>
        <p className='text-xl text-gray-600 mb-8'>
          Thank you for your order. We&apos;ve received your payment and will
          start processing your order shortly.
        </p>

        {orderId && (
          <div className='bg-gray-50 rounded-lg p-6 mb-8'>
            <p className='text-sm text-gray-500 mb-2'>Order ID</p>
            <p className='text-2xl font-mono font-bold text-gray-800'>
              #{orderId}
            </p>
          </div>
        )}

        <div className='space-y-4 text-left bg-white rounded-lg p-6 mb-8'>
          <h2 className='text-xl font-semibold mb-4'>What&apos;s Next?</h2>
          <ul className='space-y-3 text-gray-600'>
            <li className='flex items-start'>
              <span className='mr-2'>✓</span>
              <span>
                You&apos;ll receive an order confirmation email shortly
              </span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2'>✓</span>
              <span>
                We&apos;ll notify you when your order is ready for shipping
              </span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2'>✓</span>
              <span>
                Track your order status through the tracking link in your email
              </span>
            </li>
          </ul>
        </div>

        <div className='flex gap-4 justify-center'>
          <Link href='/'>
            <Button className='bg-orange-400 hover:bg-orange-500'>
              Continue Shopping
            </Button>
          </Link>
          <Link href='/my-profile'>
            <Button variant='outline'>View My Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
