'use client';

import { useCartStore } from '@/store/useCart';
import { useCartCalculations } from '@/hooks/use-cart-calculations';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { productApi } from '@/lib/api-helper';
import { PromoCodeType } from '@/types';
import {
  countries,
  countryCodeToName,
  countryStateMap,
} from '@/lib/country-codes';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUser } from '@/hooks';

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCartStore();

  // Disable auto-fetch for public checkout page to support guest users
  const { fetchMe } = useUser(false);
  const { productsWithDetails, calculations, loading } =
    useCartCalculations(items);

  // Form state - initialize empty for guest users
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    state: '',
    deliveryMethod: 'SHIPPING',
  });

  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  // Shipping & promo state
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<Omit<
    PromoCodeType,
    'id'
  > | null>(null);
  const [countryCode, setCountryCode] = useState('');

  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availabilityErrors, setAvailabilityErrors] = useState<string[]>([]);

  // Try to fetch user data once on mount if there's a token
  useEffect(() => {
    const checkUserData = async () => {
      try {
        const response = await axios.get('/api/v1/protected/me');

        if (response.data && response.data.user) {
          setFormData((prev) => ({
            ...prev,
            name: response.data.user.name || '',
            email: response.data.user.email || '',
          }));
          setIsUserDataLoaded(true);
        }
      } catch (error) {
        // Silently fail for guest users
        console.log('Guest checkout - no user data available');
      }
    };

    checkUserData();
  }, []);

  useEffect(() => {
    const errorData = sessionStorage.getItem('paymentError');
    if (errorData) {
      try {
        const { message, errors } = JSON.parse(errorData);

        if (errors && errors.length > 0) {
          setAvailabilityErrors(errors);
          toast.error(message || 'Some items are not available');
        }

        sessionStorage.removeItem('paymentError');
      } catch (e) {
        console.error('Failed to parse payment error:', e);
      }
    }
  }, []);

  // Calculate total quantity
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate shipping cost
  const calculateShipping = useCallback(
    async (countryCode: string) => {
      if (!countryCode || totalQuantity === 0) return;

      setShippingLoading(true);
      try {
        const region = countryCode === 'AU' ? 'INSIDE_AU' : 'OUTSIDE_AU';
        const response = await axios.post('/api/v1/public/shipping', {
          quantity: totalQuantity,
          region,
        });

        if (response.data.success) {
          setShippingCost(response.data.data.totalShippingCost);
        }
      } catch (error) {
        console.error('Shipping calculation error:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to calculate shipping'
        );
      } finally {
        setShippingLoading(false);
      }
    },
    [totalQuantity]
  );

  // Handle country change
  useEffect(() => {
    if (countryCode) {
      const states =
        countryStateMap[countryCode as keyof typeof countryStateMap] || [];
      setAvailableStates(states);
      setFormData((prev) => ({ ...prev, state: '' }));

      // Calculate shipping when country changes
      calculateShipping(countryCode);
    }
  }, [countryCode, calculateShipping]);

  // Handle country change
  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    const countryName =
      countryCodeToName[code as keyof typeof countryCodeToName];
    setFormData((prev) => ({ ...prev, country: countryName }));
  };

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const response = await productApi.public.products.getPromoCode(
        promoCode.trim()
      );

      if (response.status) {
        const promo = response.data.data;

        setAppliedPromo(promo);
        setPromoDiscount(promo.amount);
        toast.success('Promo code applied successfully!');
      }
    } catch (error) {
      console.error('Promo code error:', error);
      toast.error('Invalid promo code');
      setAppliedPromo(null);
      setPromoDiscount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  // Remove promo code
  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setPromoDiscount(0);
    toast.success('Promo code removed');
  };

  // Calculate final total
  const finalTotal = calculations.total + shippingCost - promoDiscount;

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error('Please fill in name and email');
      return;
    }

    if (
      formData.deliveryMethod === 'SHIPPING' &&
      (!formData.address || !formData.country || !formData.state)
    ) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Store checkout data in sessionStorage for payment page
    const checkoutData = {
      formData,
      shippingCost,
      promoDiscount,
      appliedPromo,
      calculations,
      finalTotal,
      items: productsWithDetails.flatMap((product) =>
        product.variants.map((variant) => ({
          productId: product.productId,
          slug: product.slug,
          title: product.details?.title || 'Product',
          color: variant.color,
          size: variant.size,
          printSide: variant.printSide,
          quantity: variant.quantity,
          image: variant.image,
          price: (() => {
            const matchingVariant = product.details?.variants.find(
              (v) =>
                v.color.name === variant.color && v.size.name === variant.size
            );
            let itemPrice = matchingVariant
              ? matchingVariant.price
              : product.details?.minPrice || 0;
            if (variant.printSide === 'two' && product.details?.twoSidePrice) {
              itemPrice += product.details.twoSidePrice;
            }
            return itemPrice;
          })(),
          total: (() => {
            const matchingVariant = product.details?.variants.find(
              (v) =>
                v.color.name === variant.color && v.size.name === variant.size
            );
            let itemPrice = matchingVariant
              ? matchingVariant.price
              : product.details?.minPrice || 0;
            if (variant.printSide === 'two' && product.details?.twoSidePrice) {
              itemPrice += product.details.twoSidePrice;
            }
            return itemPrice * variant.quantity;
          })(),
          customizations: variant.customizations || [],
          variantId: product.details?.variants.find(
            (v) =>
              v.color.name === variant.color && v.size.name === variant.size
          )?.id,
        }))
      ),
    };

    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    router.push('/payment');
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-16'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <Loader2 className='animate-spin' size={40} />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center py-20'>
          <h1 className='text-4xl font-bold mb-4'>Your Cart is Empty</h1>
          <p className='text-gray-500 mb-8'>Add some products to checkout!</p>
          <Link href='/'>
            <Button className='bg-orange-400 hover:bg-orange-500'>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <div className='container mx-auto px-4 py-16'>
        <h1 className='text-4xl font-bold mb-8'>Checkout</h1>

        {/* Availability Errors */}
        {availabilityErrors.length > 0 && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <h3 className='text-red-800 font-semibold mb-2'>
              ⚠️ Product Availability Issues
            </h3>
            <ul className='list-disc list-inside space-y-1'>
              {availabilityErrors.map((error, index) => (
                <li key={index} className='text-red-600 text-sm'>
                  {error}
                </li>
              ))}
            </ul>
            <p className='text-red-600 text-sm mt-2'>
              Please update your cart before proceeding to payment.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 space-y-6'>
              <RadioGroup
                defaultValue='SHIPPING'
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    deliveryMethod: value,
                    address: value === 'PICKUP' ? '' : formData.address,
                    country: value === 'PICKUP' ? '' : formData.country,
                    state: value === 'PICKUP' ? '' : formData.state,
                  });
                  if (value === 'PICKUP') {
                    setShippingCost(0);
                    setCountryCode('');
                  }
                }}
                className='flex '
              >
                <div className='flex items-center gap-3'>
                  <RadioGroupItem value='SHIPPING' id='SHIPPING' />
                  <Label htmlFor='SHIPPING'>Shipping</Label>
                </div>
                <div className='flex items-center gap-3'>
                  <RadioGroupItem value='PICKUP' id='PICKUP' />
                  <Label htmlFor='PICKUP'>Pickup</Label>
                </div>
              </RadioGroup>

              {/* Contact Information */}
              <div className='bg-white  p-6 shadow-sm'>
                <h2 className='text-2xl font-semibold mb-4'>
                  Contact Information
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Full Name *</Label>
                    <Input
                      id='name'
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      disabled={!!fetchMe?.name && fetchMe.role === 'CUSTOMER'}
                      className='rounded-none'
                      placeholder='John Doe'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email *</Label>
                    <Input
                      id='email'
                      type='email'
                      required
                      value={formData.email}
                      disabled={!!fetchMe?.email && fetchMe.role === 'CUSTOMER'}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className='rounded-none'
                      placeholder='john@example.com'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phone'>Phone</Label>
                    <Input
                      id='phone'
                      type='tel'
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className='rounded-none'
                      placeholder='+61 XXX XXX XXX'
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {formData.deliveryMethod === 'SHIPPING' && (
                <div className='bg-white  p-6 shadow-sm'>
                  <h2 className='text-2xl font-semibold mb-4'>
                    Shipping Address
                  </h2>
                  <div className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-2'>
                        <Label htmlFor='country'>
                          Country{' '}
                          {formData.deliveryMethod === 'SHIPPING' && '*'}
                        </Label>
                        <Select
                          value={countryCode}
                          onValueChange={(value) => handleCountryChange(value)}
                          required={formData.deliveryMethod === 'SHIPPING'}
                        >
                          <SelectTrigger className='w-full rounded-none'>
                            <SelectValue placeholder='Select country' />
                          </SelectTrigger>
                          <SelectContent className='rounded-none'>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {
                                  countryCodeToName[
                                    country as keyof typeof countryCodeToName
                                  ]
                                }
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {countryCode && availableStates.length > 0 && (
                        <div className='space-y-2'>
                          <Label htmlFor='state'>
                            State/City{' '}
                            {formData.deliveryMethod === 'SHIPPING' && '*'}
                          </Label>
                          <Select
                            value={formData.state}
                            onValueChange={(value) =>
                              setFormData({ ...formData, state: value })
                            }
                            required={formData.deliveryMethod === 'SHIPPING'}
                          >
                            <SelectTrigger className='w-full rounded-none'>
                              <SelectValue placeholder='Select state' />
                            </SelectTrigger>
                            <SelectContent className='rounded-none'>
                              {availableStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='address'>
                        Street Address{' '}
                        {formData.deliveryMethod === 'SHIPPING' && '*'}
                      </Label>
                      <Textarea
                        placeholder='Enter discount note here'
                        className='resize-none rounded-none'
                        id='address'
                        required={formData.deliveryMethod === 'SHIPPING'}
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className='lg:col-span-1'>
              <div className='bg-white p-6 shadow-sm sticky top-4'>
                <h2 className='text-2xl font-bold mb-4'>Order Summary</h2>

                {/* Products */}
                <div className='space-y-3 mb-4 max-h-60 overflow-y-auto'>
                  {productsWithDetails.map((product) =>
                    product.variants.map((variant, index) => (
                      <div
                        key={`${product.productId}-${variant.size}-${variant.color}-${index}`}
                        className='flex gap-3 pb-3 border-b'
                      >
                        <Image
                          src={variant.image}
                          alt={product.details?.title || 'Product'}
                          width={60}
                          height={60}
                          className='rounded object-cover'
                        />
                        <div className='flex-1 text-sm'>
                          <p className='font-medium line-clamp-1'>
                            {product.details?.title}
                          </p>
                          <p className='text-gray-500 text-xs'>
                            {variant.color} / {variant.size.toUpperCase()}
                          </p>
                          <p className='text-gray-500 text-xs'>
                            Qty: {variant.quantity}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Promo Code */}
                <div className='mb-4 space-y-2'>
                  <Label>Promo Code</Label>
                  <div className='flex gap-2 mt-1'>
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder='Enter code'
                      disabled={!!appliedPromo}
                      className='rounded-none'
                    />
                    {appliedPromo ? (
                      <Button
                        type='button'
                        onClick={handleRemovePromo}
                        variant='outline'
                        className='rounded-none'
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type='button'
                        onClick={handleApplyPromo}
                        disabled={promoLoading}
                        variant='outline'
                        className='rounded-none'
                      >
                        {promoLoading ? (
                          <Loader2 className='animate-spin' size={16} />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    )}
                  </div>
                  {appliedPromo && (
                    <p className='text-sm text-green-600 mt-1'>
                      ✓ {appliedPromo.title} applied!
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className='space-y-2 text-sm mb-4'>
                  <div className='flex justify-between'>
                    <span>Subtotal:</span>
                    <span>AU${calculations.subtotal.toFixed(2)}</span>
                  </div>
                  {calculations.quantityDiscount > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>Quantity Discount:</span>
                      <span>
                        -AU${calculations.quantityDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {calculations.flatDiscount > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>Flat Discount:</span>
                      <span>-AU${calculations.flatDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span>Shipping:</span>
                    <span>
                      {shippingLoading ? (
                        <Loader2 className='animate-spin inline' size={14} />
                      ) : (
                        `AU$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>Promo Discount:</span>
                      <span>-AU${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className='border-t pt-3 mb-6'>
                  <div className='flex justify-between text-xl font-bold'>
                    <span>Total:</span>
                    <span>AU${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type='submit'
                  className='w-full bg-orange-400 hover:bg-orange-500 text-white text-lg py-6 rounded-none'
                  disabled={shippingLoading}
                >
                  {shippingLoading ? (
                    <Loader2 className='animate-spin' />
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
