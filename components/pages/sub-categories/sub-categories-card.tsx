import { SubCategoryType } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderTree, Package, Tag } from 'lucide-react';
import Link from 'next/link';

type SubCategoriesCardProps = {
  data?: SubCategoryType[];
};

export function SubCategoriesCard({ data }: SubCategoriesCardProps) {
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
        <Link key={subcategory.id} href='#'>
          <Card className='cursor-pointer'>
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
        </Link>
      ))}
    </div>
  );
}
