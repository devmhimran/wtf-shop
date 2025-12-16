'use client';

import { useCartStore } from '@/store/useCart';
import { useState } from 'react';
import { CartCustomization } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useCartCalculations } from '@/hooks/use-cart-calculations';

export default function Cart() {
  const { items, updateQty, removeItem, clearCart } = useCartStore();
  const { productsWithDetails, calculations, loading } =
    useCartCalculations(items);
  const [selectedCustomization, setSelectedCustomization] = useState<{
    productId: number;
    customizations: CartCustomization[];
  } | null>(null);

  const handleUpdateQuantity = (
    productId: number,
    size: string,
    color: string,
    newQty: number
  ) => {
    if (newQty < 1) {
      removeItem(productId, size, color);
      toast.success('Item removed from cart');
    } else {
      updateQty(productId, size, color, newQty);
    }
  };

  const handleRemoveItem = (productId: number, size: string, color: string) => {
    removeItem(productId, size, color);
    toast.success('Item removed from cart');
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-16'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-lg'>Loading cart...</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className='container mx-auto px-4 py-16'>
        <div className='text-center py-20'>
          <h1 className='text-4xl font-bold mb-4'>Your Cart is Empty</h1>
          <p className='text-gray-500 mb-8'>
            Add some products to get started!
          </p>
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
    <div>
      <div className='container mx-auto px-4 py-16'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-4xl font-bold'>Shopping Cart</h1>
          <Button
            variant='outline'
            onClick={() => {
              clearCart();
              toast.success('Cart cleared');
            }}
            className='text-red-500 hover:text-red-700'
          >
            Clear Cart
          </Button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Cart Items */}
          <div className='lg:col-span-2 space-y-6'>
            {productsWithDetails.map((product) => (
              <div
                key={product.productId}
                className='border rounded-lg p-6 bg-white shadow-sm'
              >
                {/* Product Header */}
                <div className='mb-4'>
                  <Link href={`/product-details/${product.slug}`}>
                    <h2 className='text-2xl font-semibold hover:text-orange-500'>
                      {product.details?.title || 'Product'}
                    </h2>
                  </Link>
                  {product.details?.flatDiscount &&
                    product.details.flatDiscount > 0 && (
                      <span className='inline-block mt-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded'>
                        {product.details.flatDiscount}% OFF
                      </span>
                    )}
                </div>

                {/* Variants */}
                <div className='space-y-4'>
                  {product.variants.map((variant, index) => {
                    const matchingVariant = product.details?.variants.find(
                      (v) =>
                        v.color.name === variant.color &&
                        v.size.name === variant.size
                    );
                    const basePrice = matchingVariant
                      ? matchingVariant.price
                      : product.details?.minPrice || 0;
                    const printSidePrice =
                      variant.printSide === 'two' &&
                      product.details?.twoSidePrice
                        ? product.details.twoSidePrice
                        : 0;
                    const totalPrice =
                      (basePrice + printSidePrice) * variant.quantity;

                    return (
                      <div
                        key={`${variant.color}-${variant.size}-${index}`}
                        className='flex gap-4 p-4 border rounded-lg hover:border-orange-300 transition-colors'
                      >
                        {/* Image */}
                        <div className='shrink-0'>
                          <Image
                            src={variant.image}
                            alt={`${variant.color} ${variant.size}`}
                            width={100}
                            height={100}
                            className='object-cover rounded'
                          />
                        </div>

                        {/* Details */}
                        <div className='grow'>
                          <div className='flex justify-between items-start mb-2'>
                            <div>
                              <p className='font-medium'>
                                Color:{' '}
                                <span className='capitalize'>
                                  {variant.color}
                                </span>
                              </p>
                              <p className='text-gray-600'>
                                Size:{' '}
                                <span className='uppercase'>
                                  {variant.size}
                                </span>
                              </p>
                              <p className='text-gray-600 text-sm'>
                                Print:{' '}
                                {variant.printSide === 'one'
                                  ? 'Front'
                                  : 'Front & Back'}
                              </p>
                              {printSidePrice > 0 && (
                                <p className='text-sm text-gray-500'>
                                  Print side: +AU${printSidePrice.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleRemoveItem(
                                  product.productId,
                                  variant.size,
                                  variant.color
                                )
                              }
                              className='text-red-500 hover:text-red-700 hover:bg-red-50'
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>

                          {/* Customizations */}
                          {variant.customizations &&
                            Array.isArray(variant.customizations) &&
                            variant.customizations.length > 0 && (
                              <div className='mb-2'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() =>
                                    setSelectedCustomization({
                                      productId: product.productId,
                                      customizations: variant.customizations!,
                                    })
                                  }
                                  className='text-xs'
                                >
                                  View Customizations (
                                  {variant.customizations.length})
                                </Button>
                              </div>
                            )}

                          {/* Quantity and Price */}
                          <div className='flex items-center justify-between mt-3'>
                            <div className='flex items-center gap-2 border rounded-lg'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleUpdateQuantity(
                                    product.productId,
                                    variant.size,
                                    variant.color,
                                    variant.quantity - 1
                                  )
                                }
                                className='h-8 w-8 p-0'
                              >
                                <Minus size={16} />
                              </Button>
                              <span className='w-12 text-center font-medium'>
                                {variant.quantity}
                              </span>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleUpdateQuantity(
                                    product.productId,
                                    variant.size,
                                    variant.color,
                                    variant.quantity + 1
                                  )
                                }
                                className='h-8 w-8 p-0'
                              >
                                <Plus size={16} />
                              </Button>
                            </div>
                            <p className='text-lg font-semibold'>
                              AU${totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Product-level discount info */}
                {product.details && (
                  <div className='mt-4 pt-4 border-t'>
                    <div className='text-sm text-gray-600'>
                      <p>
                        Total Quantity:{' '}
                        <span className='font-medium'>
                          {product.variants.reduce(
                            (sum, v) => sum + v.quantity,
                            0
                          )}{' '}
                          items
                        </span>
                      </p>
                      {product.details.quantityDiscounts &&
                        product.details.quantityDiscounts.length > 0 && (
                          <p className='text-xs text-green-600 mt-1'>
                            Quantity discounts available
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className='lg:col-span-1'>
            <div className='border rounded-lg p-6 bg-white shadow-sm sticky top-24'>
              <h2 className='text-2xl font-bold mb-6'>Order Summary</h2>

              <div className='space-y-3 mb-6'>
                <div className='flex justify-between text-gray-600'>
                  <span>Subtotal:</span>
                  <span>AU${calculations.subtotal.toFixed(2)}</span>
                </div>
                {calculations.quantityDiscount > 0 && (
                  <div className='flex justify-between text-green-600 font-medium'>
                    <span>Quantity Discount:</span>
                    <span>-AU${calculations.quantityDiscount.toFixed(2)}</span>
                  </div>
                )}
                {calculations.flatDiscount > 0 && (
                  <div className='flex justify-between text-green-600 font-medium'>
                    <span>Flat Discount:</span>
                    <span>-AU${calculations.flatDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className='border-t pt-3'>
                  <div className='flex justify-between text-xl font-bold'>
                    <span>Total:</span>
                    <span>AU${calculations.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link href='/checkout'>
                <Button className='w-full bg-orange-400 hover:bg-orange-500 text-white text-lg py-6'>
                  Proceed to Checkout
                </Button>
              </Link>

              <Link href='/'>
                <Button variant='outline' className='w-full mt-3'>
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Customization Modal */}
        {selectedCustomization && (
          <div
            className='fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4'
            onClick={() => setSelectedCustomization(null)}
          >
            <div
              className='bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex justify-between items-center mb-6'>
                <h3 className='text-2xl font-bold'>Customizations</h3>
                <Button
                  variant='ghost'
                  onClick={() => setSelectedCustomization(null)}
                  className='p-2'
                >
                  <X size={24} />
                </Button>
              </div>

              <div className='space-y-4'>
                {Array.isArray(selectedCustomization.customizations) &&
                  selectedCustomization.customizations.map(
                    (customization: CartCustomization, index: number) => (
                      <div key={index} className='border rounded-lg p-4'>
                        <h4 className='font-semibold mb-3'>
                          Customization {index + 1}
                        </h4>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          {customization.imagePreview && (
                            <div>
                              <p className='text-sm font-medium mb-2'>Image:</p>
                              <Image
                                src={customization.imagePreview}
                                alt={`Customization ${index + 1}`}
                                width={200}
                                height={200}
                                className='rounded border'
                              />
                              {customization.imageName && (
                                <p className='text-xs text-gray-500 mt-1'>
                                  {customization.imageName}
                                </p>
                              )}
                            </div>
                          )}
                          {customization.note && (
                            <div>
                              <p className='text-sm font-medium mb-2'>Note:</p>
                              <p className='text-gray-700 bg-gray-50 p-3 rounded'>
                                {customization.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
