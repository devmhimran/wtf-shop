'use client';

import { useCart } from '@/store/useCart';

export default function Cart() {
  const { getTotalItems, getTotalPrice, items } = useCart();
  console.log({
    getTotalPrice: getTotalPrice(),
    getTotalItems: getTotalItems(),
    items,
  });
  return <div>Cart</div>;
}
