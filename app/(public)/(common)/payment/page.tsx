'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import PaymentForm from '@/components/public-pages/payment/payment-form';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_PUBLISH_KEY!);

interface CartCustomization {
  imagePreview: string;
  imageName: string;
  note: string;
}

interface CartItem {
  productId: number;
  variantId: number;
  color: string;
  size: string;
  printSide: string;
  quantity: number;
  price: number;
  total: number;
  image: string;
  title: string;
  customizations?: CartCustomization[];
}

interface CheckoutData {
  finalTotal: number;
  formData: {
    email: string;
    name: string;
    phone: string;
    address: string;
    city?: string;
    state: string;
    postalCode?: string;
    country: string;
  };
  items: CartItem[];
  calculations: {
    total: number;
    subtotal: number;
    quantityDiscount: number;
    flatDiscount: number;
  };
  shippingCost: number;
  promoDiscount?: number;
  appliedPromo?: {
    code: string;
  };
}

export default function PaymentPage() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  const createPaymentIntent = useCallback(
    async (data: CheckoutData) => {
      try {
        const response = await fetch('/api/v1/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: data.finalTotal,
            email: data.formData.email,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setClientSecret(result.data.clientSecret);
        } else {
          console.error('Failed to create payment intent');
          router.push('/checkout');
        }
      } catch (error) {
        console.error('Payment intent error:', error);
        router.push('/checkout');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    // Get checkout data from sessionStorage
    const data = sessionStorage.getItem('checkoutData');

    if (!data) {
      router.push('/checkout');
      return;
    }

    const parsedData = JSON.parse(data);
    setCheckoutData(parsedData);

    // Create payment intent
    createPaymentIntent(parsedData);
  }, [router, createPaymentIntent]);

  if (loading || !clientSecret || !checkoutData) {
    return (
      <div className='container mx-auto px-4 py-16'>
        <div className='flex flex-col items-center justify-center min-h-[400px]'>
          <Loader2 className='animate-spin mb-4' size={40} />
          <p>Loading payment...</p>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className='bg-gray-50/70 min-h-screen'>
      <div className='container mx-auto px-4 py-16'>
        <h1 className='text-4xl font-bold mb-8'>Payment</h1>

        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            checkoutData={checkoutData}
            clientSecret={clientSecret}
          />
        </Elements>
      </div>
    </div>
  );
}
