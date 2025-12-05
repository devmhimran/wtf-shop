'use client';

import { useGetAllCategories, useGetAllSubCategories } from '@/hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

type ParamsType = {
  search: string;
  page: string;
  stock: string;
  is_new: string;
  price: string;
  category: string;
  subCategory: string;
};

type ProductFilterProps = {
  setParams: React.Dispatch<React.SetStateAction<ParamsType>>;
  params: ParamsType;
};

export function ProductFilter({ setParams, params }: ProductFilterProps) {
  const { fetchAllCategoriesMutationData } = useGetAllCategories('');
  const { fetchAllSubCategoriesMutationData } = useGetAllSubCategories('');

  const handleReset = () => {
    setParams({
      search: '',
      page: '1',
      stock: '',
      is_new: '',
      price: '',
      category: '',
      subCategory: '',
    });
  };

  const handleFilterChange = (key: keyof ParamsType, value: string) => {
    setParams((prev) => ({
      ...prev,
      [key]: value === 'all' ? '' : value,
      page: '1',
    }));
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold'>Filters</h3>
        <Button
          variant='outline'
          size='sm'
          onClick={handleReset}
          className='gap-2'
        >
          <RotateCcw className='w-4 h-4' />
          Reset
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Category Filter */}
        <div className='space-y-2'>
          <Label>Category</Label>
          <Select
            value={params.category}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='All Categories' />
            </SelectTrigger>
            <SelectContent className='z-999'>
              <SelectItem value='all'>All Categories</SelectItem>
              {fetchAllCategoriesMutationData?.data?.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Category Filter */}
        <div className='space-y-2'>
          <Label>Sub Category</Label>
          <Select
            value={params.subCategory}
            onValueChange={(value) => handleFilterChange('subCategory', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='All Sub Categories' />
            </SelectTrigger>
            <SelectContent className='z-999'>
              <SelectItem value='all'>All Sub Categories</SelectItem>
              {fetchAllSubCategoriesMutationData?.data?.map((subCategory) => (
                <SelectItem key={subCategory.id} value={String(subCategory.id)}>
                  {subCategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stock Status Filter */}
        <div className='space-y-2'>
          <Label>Stock Status</Label>
          <Select
            value={params.stock}
            onValueChange={(value) => handleFilterChange('stock', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='All Stock' />
            </SelectTrigger>
            <SelectContent className='z-999'>
              <SelectItem value='all'>All Stock</SelectItem>
              <SelectItem value='IN_STOCK'>In Stock</SelectItem>
              <SelectItem value='OUT_OF_STOCK'>Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* New Product Filter */}
        <div className='space-y-2'>
          <Label>New Products</Label>
          <Select
            value={params.is_new}
            onValueChange={(value) => handleFilterChange('is_new', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='All Products' />
            </SelectTrigger>
            <SelectContent className='z-999'>
              <SelectItem value='all'>All Products</SelectItem>
              <SelectItem value='true'>New</SelectItem>
              <SelectItem value='false'>Old</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Sort Filter */}
        <div className='space-y-2'>
          <Label>Sort by Price</Label>
          <Select
            value={params.price}
            onValueChange={(value) => handleFilterChange('price', value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Default' />
            </SelectTrigger>
            <SelectContent className='z-999'>
              <SelectItem value='all'>Default</SelectItem>
              <SelectItem value='LOW_TO_HIGH'>Low to High</SelectItem>
              <SelectItem value='HIGH_TO_LOW'>High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
