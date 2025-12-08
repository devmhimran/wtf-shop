'use client';

import { ProductType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontalIcon } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmModal } from '@/components/shared';
import { useState } from 'react';
import { useProducts } from '@/hooks';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { productTypeTypes } from '@/lib/utils';

type ProductPhoneCardProps = {
  data: ProductType;
  index: number;
};

export function ProductPhoneCard({ data, index }: ProductPhoneCardProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const { minPrice, maxPrice, quantity: totalQuantity, inStock } = data;
  const { deleteProductAsync } = useProducts();

  const handleDeleteProduct = () => {
    setIsPending(true);
    if (!data.id) return;

    toast.promise(deleteProductAsync(data.id), {
      loading: 'Deleting product...',
      success: () => {
        setConfirmModal(false);
        setIsPending(false);
        return 'Successfully product deleted';
      },
      error: (error) => {
        setIsPending(false);
        return (
          error?.response?.data?.error ||
          error.message ||
          'Failed to delete product'
        );
      },
    });
  };

  return (
    <Card className='group overflow-hidden hover:shadow-md transition-all duration-300 border hover:border-primary/20 p-0'>
      <CardContent className='p-4'>
        {/* Image Section */}
        <div className='relative w-full rounded-lg overflow-hidden bg-muted shadow-sm mb-3'>
          {data.mainImage ? (
            <Image
              src={data.mainImage.fileUrl}
              alt={data.title}
              width={200}
              height={200}
              className='w-full h-50 object-cover group-hover:scale-105 transition-transform duration-500'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-muted'>
              <span className='text-muted-foreground text-sm'>No Image</span>
            </div>
          )}
          {data.isNew && (
            <Badge className='absolute top-2 left-2 text-xs px-2 py-0.5 h-6 bg-green-500 hover:bg-green-600 shadow-md'>
              New
            </Badge>
          )}
          <Badge
            className={`absolute bottom-2 left-2 text-xs px-2 py-0.5 h-6 shadow-md ${
              inStock
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {inStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>

        {/* Content Section */}
        <div className='space-y-4'>
          {/* Title and Actions */}
          <div className='flex items-start justify-between gap-2'>
            <div className='flex-1 min-w-0'>
              <div className='flex gap-2'>
                <div className='text-sm text-muted-foreground'>
                  #{index + 1}
                </div>
                <h3 className='font-bold text-base line-clamp-2 group-hover:text-primary transition-colors mb-1'>
                  {data.title}
                </h3>
              </div>
              <p className='text-xs text-muted-foreground line-clamp-1'>
                CatalogId: {data.catalogId || 'No Catalog ID'}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='icon-sm' className='shrink-0'>
                  <MoreHorizontalIcon className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/dashboard/products/update-product/${data.id}`)
                  }
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='text-red-500'
                  onClick={() => setConfirmModal(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category Badges */}
          <div className='flex items-center gap-2 flex-wrap'>
            <Badge
              variant='secondary'
              className='text-xs px-2 py-0.5 h-5 font-medium'
            >
              {data.category?.name || 'Uncategorized'}
            </Badge>
            {data.subCategory && (
              <Badge variant='outline' className='text-xs px-2 py-0.5 h-5'>
                {data.subCategory?.name}
              </Badge>
            )}
            <Badge variant='outline' className='text-xs px-2 py-0.5 h-5'>
              {productTypeTypes[data.productType]}
            </Badge>
          </div>
          <div className='text-sm flex gap-2 items-center'>
            <span className='text-muted-foreground text-xs'>
              Flat Discount:
            </span>
            {data.flatDiscount ? (
              <Badge variant='outline'>{`AU$${data.flatDiscount.toFixed(
                2
              )}`}</Badge>
            ) : (
              'N/A'
            )}
          </div>
          {/* Price */}
          <div className='flex items-center justify-between'>
            <div>
              <span className='text-xs text-muted-foreground block mb-0.5'>
                Price
              </span>
              <span className='font-bold text-foreground text-base'>
                {minPrice === maxPrice
                  ? `AU$${minPrice.toFixed(2)}`
                  : `AU$${minPrice.toFixed(2)} - AU$${maxPrice.toFixed(2)}`}
              </span>
            </div>
            <div className='text-right'>
              <span className='text-xs text-muted-foreground block mb-0.5'>
                Qty
              </span>
              <span
                className={`font-bold text-base ${
                  totalQuantity === 0 ? 'text-rose-500' : 'text-emerald-600'
                }`}
              >
                {totalQuantity}
              </span>
            </div>
          </div>

          {/* Variants Count */}
          <div className='pt-2 border-t'>
            <span className='text-xs text-muted-foreground'>
              {data.variants?.length || 0} Variant
              {data.variants?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>

      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your product'
        onClick={handleDeleteProduct}
      />
    </Card>
  );
}
