'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FolderOpen, Package, Layers, EllipsisVertical } from 'lucide-react';

import { CategoryType } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertModal, ConfirmModal } from '@/components/shared';
import { useCategories } from '@/hooks';
import { UpdateCategoryForm } from '@/components/forms';

export function CategoriesCard({ data }: { data?: CategoryType[] }) {
  const [isPending, setIsPending] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState<CategoryType | null>(
    null
  );

  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  const { deleteCategoryAsync } = useCategories();

  const handleDeleteCategory = () => {
    setIsPending(true);
    if (!categorySlug) return;
    toast.promise(deleteCategoryAsync(categorySlug), {
      loading: 'Deleting category...',
      success: () => {
        setConfirmModal(false);
        setIsPending(false);
        return 'Successfully category deleted';
      },
      error: (error) => {
        setIsPending(false);
        return (
          error?.response?.data?.error ||
          error.message ||
          'Failed to delete user'
        );
      },
    });
  };

  const handleEditCategory = (category: CategoryType) => {
    setCategoryDetails(category);
    setOpenUpdateModal(true);
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-10'>
          <p className='text-muted-foreground'>No categories found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 font-inter'>
      {data.map((category) => (
        <Card className='p-4' key={category.id}>
          <CardHeader className='px-0'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                {category.image ? (
                  <div className='relative w-10 h-10 rounded-md overflow-hidden bg-muted'>
                    <img
                      src={category.image.fileUrl}
                      alt={category.name}
                      className='object-cover w-full h-full'
                    />
                  </div>
                ) : (
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <FolderOpen className='h-5 w-5 text-primary' />
                  </div>
                )}
                <div>
                  <CardTitle className='text-lg line-clamp-1'>
                    {category.name}
                  </CardTitle>
                  <CardDescription className='text-sm mt-1'>
                    /{category.slug}
                  </CardDescription>
                </div>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className='cursor-pointer'>
                    <EllipsisVertical className='w-4 h-4 text-gray-800' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='font-inter font-medium'>
                    <DropdownMenuLabel>Option</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleEditCategory(category)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-red-600'
                      onClick={() => {
                        setCategorySlug(category.slug);
                        setConfirmModal(true);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-3 p-0'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Layers className='h-4 w-4' />
                <span>Subcategories</span>
              </div>
              <Badge variant='secondary'>
                {category._count?.subcategories || 0}
              </Badge>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Package className='h-4 w-4' />
                <span>Products</span>
              </div>
              <Badge variant='outline'>{category._count?.products || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your category'
        onClick={handleDeleteCategory}
      />

      <AlertModal
        isOpen={openUpdateModal}
        setIsOpen={setOpenUpdateModal}
        title='Edit category'
        description=' '
      >
        <UpdateCategoryForm
          setIsOpen={setOpenUpdateModal}
          data={categoryDetails}
        />
      </AlertModal>
    </div>
  );
}
