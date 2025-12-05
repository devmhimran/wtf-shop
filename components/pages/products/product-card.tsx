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

type ProductCardProps = {
  data: ProductType;
  onDelete?: (id: number) => void;
};

export function ProductCard({ data }: ProductCardProps) {
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
    <Card className='group overflow-hidden hover:shadow-sm transition-all duration-300 border hover:border-primary/30 bg-card p-0'>
      <CardContent className='p-0'>
        <div className='flex gap-5 p-5'>
          {/* Image Section */}
          <div className='relative w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-muted shadow-sm'>
            {data.mainImage ? (
              <Image
                src={data.mainImage.fileUrl}
                alt={data.title}
                fill
                className='object-cover group-hover:scale-105 transition-transform duration-500'
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
          <div className='flex-1 min-w-0 space-y-3'>
            {/* Title and Status */}
            <div className='flex items-start justify-between gap-3'>
              <div className='flex-1 min-w-0'>
                <h3 className='font-bold text-base line-clamp-1 group-hover:text-primary transition-colors mb-1'>
                  {data.title}
                </h3>
                <p className='text-sm text-muted-foreground line-clamp-1'>
                  {data.catalogId || 'No Catalog ID'}
                </p>
              </div>
              {/* <Badge
                variant={data.isActive ? 'default' : 'secondary'}
                className='text-xs px-3 py-1 h-6 flex-shrink-0'
              >
                {data.isActive ? 'Active' : 'Inactive'}
              </Badge> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='icon-sm'>
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(
                        `/dashboard/products/update-product/${data.id}`
                      )
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

            {/* Product Type and Variants */}
            <div className='flex items-center gap-4 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground font-medium'>Type:</span>
                <Badge variant='outline' className='text-xs px-2 py-0.5 h-6'>
                  {productTypeTypes[data.productType]}
                </Badge>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground font-medium'>
                  Variants:
                </span>
                <span className='font-semibold text-foreground'>
                  {data.variants?.length || 0}
                </span>
              </div>
            </div>

            {/* Price and Quantity */}
            <div className='flex items-center gap-4 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground font-medium'>
                  Price:
                </span>
                <span className='font-bold text-foreground text-base'>
                  {minPrice === maxPrice
                    ? `AU$${minPrice.toFixed(2)}`
                    : `AU$${minPrice.toFixed(2)} - AU$${maxPrice.toFixed(2)}`}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground font-medium'>Qty:</span>
                <span
                  className={`font-bold text-base ${
                    totalQuantity === 0 ? 'text-rose-500' : 'text-emerald-600'
                  }`}
                >
                  {totalQuantity}
                </span>
              </div>
            </div>

            {/* Category Info */}
            <div className='flex items-center gap-2'>
              <Badge
                variant='secondary'
                className='text-xs px-2.5 py-1 h-6 font-medium'
              >
                {data.category?.name || 'Uncategorized'}
              </Badge>
              {data.subCategory && (
                <Badge variant='outline' className='text-xs px-2.5 py-1 h-6'>
                  {data.subCategory?.name}
                </Badge>
              )}
            </div>
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
