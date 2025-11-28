'use client';

import { SubCategoryType } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EllipsisVertical, FolderTree, Package, Tag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useSubCategories } from '@/hooks';
import { toast } from 'sonner';
import { AlertModal, ConfirmModal } from '@/components/shared';
import { UpdateSubCategoryForm } from '@/components/forms';

type SubCategoriesCardProps = {
  data?: SubCategoryType[];
};

export function SubCategoriesCard({ data }: SubCategoriesCardProps) {
  const [isPending, setIsPending] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [subCategoryDetails, setSubCategoryDetails] =
    useState<SubCategoryType | null>(null);

  const [subCategorySlug, setSubCategorySlug] = useState<string | null>(null);

  const { deleteSubCategoryAsync } = useSubCategories();

  const handleDeleteSubCategory = () => {
    setIsPending(true);
    if (!subCategorySlug) return;
    toast.promise(deleteSubCategoryAsync(subCategorySlug), {
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

  const handleEditSubCategory = (subcategory: SubCategoryType) => {
    setSubCategoryDetails(subcategory);
    setOpenUpdateModal(true);
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-10'>
          <p className='text-muted-foreground'>No subcategories found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 font-inter'>
      {data.map((subcategory) => (
        <Card key={subcategory.id} className='cursor-pointer'>
          <CardHeader className='pb-2 pt-3'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-2 flex-1'>
                <div className='p-1.5 bg-primary/10 rounded-md'>
                  <FolderTree className='h-4 w-4 text-primary' />
                </div>
                <div className='flex-1'>
                  <CardTitle className='text-sm line-clamp-1'>
                    {subcategory.name}
                  </CardTitle>
                  <CardDescription className='text-xs mt-0.5'>
                    /{subcategory.slug}
                  </CardDescription>
                </div>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger className='cursor-pointer px-2'>
                    <EllipsisVertical className='w-4 h-4 text-gray-600' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='font-inter font-medium'>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleEditSubCategory(subcategory)}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-red-600'
                      onClick={() => {
                        setSubCategorySlug(subcategory.slug);
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
          <CardContent className='space-y-1.5 pb-3'>
            {subcategory.category && (
              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <Tag className='h-3 w-3' />
                  <span className='text-xs'>Parent Category</span>
                </div>
                <Badge variant='secondary' className='text-xs h-5'>
                  {subcategory.category.name}
                </Badge>
              </div>
            )}

            <div className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-1.5 text-muted-foreground'>
                <Package className='h-3 w-3' />
                <span className='text-xs'>Products</span>
              </div>
              <Badge variant='outline' className='text-xs h-5'>
                {subcategory._count?.products || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertModal
        isOpen={openUpdateModal}
        setIsOpen={setOpenUpdateModal}
        title='Edit category'
        description=' '
      >
        <UpdateSubCategoryForm
          setIsOpen={setOpenUpdateModal}
          data={subCategoryDetails}
        />
      </AlertModal>
      <ConfirmModal
        isOpen={confirmModal}
        setIsOpen={setConfirmModal}
        loading={isPending}
        title='This action cannot be undone. This will permanently delete your subcategory'
        onClick={handleDeleteSubCategory}
      />
    </div>
  );
}
