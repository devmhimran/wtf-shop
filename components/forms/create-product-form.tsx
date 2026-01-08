'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { generateSlug, getErrorResponse } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, Plus, Trash2, FileImage, Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { CategoryType, MediaType } from '@/types';
import {
  useGetAllCategories,
  useGetAllColors,
  useGetAllSizes,
  useGetAllSubCategories,
  useProducts,
} from '@/hooks';
import { SearchAndSelect, MultiSelect, Modal } from '../shared';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ProductFeaturedImage, ProductGalleryImage } from '../pages/products';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const TextEditor = dynamic(
  () => import('@/components/shared/text-editor').then((mod) => mod.TextEditor),
  {
    ssr: false,
  }
);
const formSchema = z
  .object({
    title: z.string().min(2, {
      message: 'title must be at least 2 characters.',
    }),
    description: z.string().refine(
      (val) => {
        const stripped = val.replace(/<[^>]*>/g, '').trim();
        return stripped.length > 0;
      },
      { message: 'Description is required.' }
    ),
    shortDescription: z.string().refine(
      (val) => {
        const stripped = val.replace(/<[^>]*>/g, '').trim();
        return stripped.length > 0;
      },
      { message: 'Short Description is required.' }
    ),
    additionalDesc: z.string().refine(
      (val) => {
        const stripped = val.replace(/<[^>]*>/g, '').trim();
        return stripped.length > 0;
      },
      { message: 'Additional Description is required.' }
    ),
    slug: z.string({ message: 'Slug is required.' }).min(2, {
      message: 'Slug must be at least 2 characters.',
    }),
    catalogId: z
      .string({ message: 'Catalog ID is required.' })
      .min(2, {
        message: 'Catalog ID must be at least 2 characters.',
      })
      .optional(),
    discountNote: z.string().optional(),
    flatDiscount: z.coerce.number<number>().optional(),
    twoSidePrice: z.coerce.number<number>().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeyword: z.array(z.string()).optional(),
    isNew: z.boolean().optional(),
    productType: z.enum(['STANDARD', 'CUSTOM']),
    category: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .nullable()
      .refine((val) => val !== null && val !== undefined, {
        message: 'Category is required.',
      }),
    subCategory: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .nullable()
      .optional(),
    variants: z
      .array(
        z.object({
          colorId: z.number(),
          colorName: z.string(),
          sizeId: z.number(),
          sizeName: z.string(),
          quantity: z.number().int().min(1),
          price: z.number().min(0),
        })
      )
      .min(1, { message: 'At least one variant is required.' }),
    quantityDiscounts: z
      .array(
        z.object({
          minQty: z.number().int().min(1),
          maxQty: z.number().int().min(1),
          amount: z.number().min(0),
          note: z.string().optional(),
        })
      )
      .optional(),
    featuredImage: z
      .object({
        id: z.number(),
        fileUrl: z.string(),
        fileName: z.string(),
      })
      .nullable()
      .refine((val) => val !== null && val !== undefined, {
        message: 'Featured image is required.',
      }),
    alternativeImage: z
      .object({
        id: z.number(),
        fileUrl: z.string(),
        fileName: z.string(),
      })
      .nullable()
      .optional(),
    galleryImages: z
      .array(
        z.object({
          id: z.number(),
          fileUrl: z.string(),
          fileName: z.string(),
        })
      )
      .optional(),
  })
  .strict();

export function CreateProductForm() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Pick<
    CategoryType,
    'id' | 'name'
  > | null>(null);
  const [searchCategory, setSearchCategory] = useState('');

  const [selectedSubCategory, setSelectedSubCategory] = useState<Pick<
    CategoryType,
    'id' | 'name'
  > | null>(null);
  const [searchSubCategory, setSearchSubCategory] = useState('');

  // For bulk mode
  const [selectedColors, setSelectedColors] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [selectedSizes, setSelectedSizes] = useState<
    Array<{ value: number; label: string }>
  >([]);
  const [bulkQuantity, setBulkQuantity] = useState<number>(0);
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [metaKeywords, setMetaKeywords] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [variantMode, setVariantMode] = useState<'bulk' | 'individual'>('bulk');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      shortDescription: '',
      additionalDesc: '',
      slug: '',
      discountNote: '',
      catalogId: '',
      flatDiscount: 0,
      twoSidePrice: 0,
      metaTitle: '',
      metaDescription: '',
      productType: 'STANDARD',
      metaKeyword: [],
      isNew: false,
      category: null,
      subCategory: null,
      variants: [],
      quantityDiscounts: [],
      featuredImage: null,
      alternativeImage: null,
      galleryImages: [],
    },
  });

  const [isPending, setIsPending] = useState(false);
  const [openFeaturedImage, setOpenFeaturedImage] = useState(false);
  const [openAlternativeImage, setOpenAlternativeImage] = useState(false);
  const [openGalleryImages, setOpenGalleryImages] = useState(false);

  const [featuredImage, setFeaturedImage] = useState<MediaType | null>(null);
  const [alternativeImage, setAlternativeImage] = useState<MediaType | null>(
    null
  );

  const [galleryImages, setGalleryImages] = useState<MediaType[] | null>([]);

  const { fetchAllSubCategoriesMutationData } = useGetAllSubCategories(
    searchSubCategory ? `?search=${searchSubCategory}` : ''
  );
  const { fetchAllCategoriesMutationData } = useGetAllCategories(
    searchCategory ? `?search=${searchCategory}` : ''
  );

  const { fetchAllSizesMutationData } = useGetAllSizes('');
  const { fetchAllColorsMutationData } = useGetAllColors('');
  const { createProductAsync } = useProducts();

  const handleGenerateBulkVariants = () => {
    const variants = [];
    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        variants.push({
          colorId: color.value,
          colorName: color.label,
          sizeId: size.value,
          sizeName: size.label,
          quantity: bulkQuantity,
          price: bulkPrice,
        });
      }
    }
    form.setValue('variants', variants);
  };

  const handleAddIndividualVariant = () => {
    const currentVariants = form.getValues('variants') || [];
    form.setValue('variants', [
      ...currentVariants,
      {
        colorId: 0,
        colorName: '',
        sizeId: 0,
        sizeName: '',
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    const currentVariants = form.getValues('variants') || [];
    form.setValue(
      'variants',
      currentVariants.filter((_, i) => i !== index)
    );
  };

  const handleAddQuantityDiscount = () => {
    const currentDiscounts = form.getValues('quantityDiscounts') || [];
    form.setValue('quantityDiscounts', [
      ...currentDiscounts,
      {
        minQty: 1,
        maxQty: 1,
        amount: 0,
        note: '',
      },
    ]);
  };

  const handleRemoveQuantityDiscount = (index: number) => {
    const currentDiscounts = form.getValues('quantityDiscounts') || [];
    form.setValue(
      'quantityDiscounts',
      currentDiscounts.filter((_, i) => i !== index)
    );
  };

  const handleFeaturedImageChange = (image: MediaType | null) => {
    setFeaturedImage(image);
    if (image) {
      form.setValue('featuredImage', {
        id: image.id,
        fileUrl: image.fileUrl,
        fileName: image.fileName,
      });
    } else {
      form.setValue('featuredImage', null);
    }
  };

  const handleAlternativeImageChange = (image: MediaType | null) => {
    setAlternativeImage(image);
    if (image) {
      form.setValue('alternativeImage', {
        id: image.id,
        fileUrl: image.fileUrl,
        fileName: image.fileName,
      });
    } else {
      form.setValue('alternativeImage', null);
    }
  };

  const handleGalleryImagesChange = (images: MediaType[] | null) => {
    setGalleryImages(images || []);
    if (images && images.length > 0) {
      form.setValue(
        'galleryImages',
        images.map((img) => ({
          id: img.id,
          fileUrl: img.fileUrl,
          fileName: img.fileName,
        }))
      );
    } else {
      form.setValue('galleryImages', []);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const response = createProductAsync(values);

    setIsPending(true);
    toast.promise(response, {
      loading: 'Creating product...',
      success: (response) => {
        form.reset();
        setIsPending(false);
        setFeaturedImage(null);
        setAlternativeImage(null);
        setGalleryImages([]);
        setMetaKeywords([]);
        setSelectedColors([]);
        setSelectedSizes([]);
        setBulkQuantity(1);
        setBulkPrice(0);
        setSelectedCategory(null);
        setSelectedSubCategory(null);
        router.push('/dashboard/products');
        return response.message || 'Successfully created Product!';
      },

      error: (error) => {
        setIsPending(false);
        const errorResponse = getErrorResponse(error);
        return errorResponse;
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl md:text-3xl font-bold'>Products</h1>

          <Button
            type='submit'
            disabled={isPending}
            className='flex justify-start'
          >
            {isPending ? (
              <Loader2Icon className='animate-spin' />
            ) : (
              <Save className='mr-2 h-4 w-4' />
            )}
            Save Changes
          </Button>
        </div>

        <Card>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 w-full'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='lg:col-span-3'>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='product name or title'
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const slug = generateSlug(e.target.value);
                          form.setValue('slug', slug);
                        }}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder='product slug' {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='shortDescription'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <TextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className='grid lg:grid-cols-2 grid-cols-1 gap-6 items-start'>
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <SearchAndSelect
                      placeholder='Search category...'
                      search={async (query: string) => {
                        setSearchCategory(query);
                        const categories =
                          fetchAllCategoriesMutationData?.data || [];
                        return categories.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                        }));
                      }}
                      onSelect={(option) => {
                        const category = {
                          id: option.value,
                          name: option.label,
                        };
                        setSearchCategory('');
                        setSelectedCategory(category);
                        field.onChange(category);
                      }}
                    />
                  </FormControl>
                  <FormMessage />

                  {selectedCategory && (
                    <div className='text-sm shadow-sm p-3 mt-2 rounded-md space-y-2'>
                      <div className='flex justify-between'>
                        <div>Category Name</div>
                        <div className='self-start'>
                          <div
                            className='bg-secondary p-1  cursor-pointer rounded-full'
                            onClick={() => {
                              setSearchCategory('');
                              setSelectedCategory(null);
                              field.onChange(null);
                            }}
                          >
                            <X className='w-3 h-3 ' />
                          </div>
                        </div>
                      </div>

                      <div className='font-semibold'>
                        {selectedCategory.name}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name='subCategory'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Sub Category</FormLabel>
                  <FormControl>
                    <SearchAndSelect
                      placeholder='Search category...'
                      search={async (query: string) => {
                        setSearchSubCategory(query);
                        const categories =
                          fetchAllSubCategoriesMutationData?.data || [];
                        return categories.map((cat) => ({
                          value: cat.id,
                          label: cat.name,
                        }));
                      }}
                      onSelect={(option) => {
                        const category = {
                          id: option.value,
                          name: option.label,
                        };
                        setSearchSubCategory('');
                        setSelectedSubCategory(category);
                        field.onChange(category);
                      }}
                    />
                  </FormControl>
                  <FormMessage />

                  {selectedSubCategory && (
                    <div className='text-sm shadow-sm p-3 mt-2 rounded-md space-y-2'>
                      <div className='flex justify-between'>
                        <div>Sub Category Name</div>
                        <div className='self-start'>
                          <div
                            className='bg-secondary p-1  cursor-pointer rounded-full'
                            onClick={() => {
                              setSearchSubCategory('');
                              setSelectedSubCategory(null);
                              field.onChange(null);
                            }}
                          >
                            <X className='w-3 h-3 ' />
                          </div>
                        </div>
                      </div>

                      <div className='font-semibold'>
                        {selectedSubCategory.name}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            /> */}
            <FormField
              control={form.control}
              name='productType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='z-9999'>
                      <SelectItem value='STANDARD'>Standard</SelectItem>
                      <SelectItem value='CUSTOM'>Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('productType') === 'CUSTOM' && (
              <FormField
                control={form.control}
                name='twoSidePrice'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Two Side Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min={0}
                        defaultValue={field.value}
                        placeholder='Flat Discount'
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Variant Mode Selection */}
        <Card>
          <CardContent className='space-y-6'>
            <div className='space-y-2'>
              <Label>Variant Entry Mode</Label>
              <RadioGroup
                onValueChange={(value) =>
                  setVariantMode(value as 'bulk' | 'individual')
                }
                value={variantMode}
                className='flex gap-4'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='bulk' id='bulk' />
                  <Label htmlFor='bulk'>
                    Bulk (Same price & quantity for all)
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='individual' id='individual' />
                  <Label htmlFor='individual'>
                    Individual (Different price & quantity)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Mode */}
        {variantMode === 'bulk' && (
          <Card>
            <CardContent className='space-y-6'>
              <div className='grid lg:grid-cols-2 grid-cols-1 gap-6'>
                <div className='space-y-2'>
                  <Label>Colors</Label>
                  <MultiSelect
                    value={selectedColors}
                    onChange={(selected) =>
                      setSelectedColors(
                        selected as Array<{ value: number; label: string }>
                      )
                    }
                    options={
                      fetchAllColorsMutationData?.data?.map((color) => ({
                        value: color.id,
                        label: color.name,
                      })) || []
                    }
                    placeholder='Select colors...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Sizes</Label>
                  <MultiSelect
                    value={selectedSizes}
                    onChange={(selected) =>
                      setSelectedSizes(
                        selected as Array<{ value: number; label: string }>
                      )
                    }
                    options={
                      fetchAllSizesMutationData?.data?.map((size) => ({
                        value: size.id,
                        label: size.name,
                      })) || []
                    }
                    placeholder='Select sizes...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Quantity (for all variants)</Label>
                  <Input
                    type='number'
                    placeholder='Enter quantity'
                    value={bulkQuantity}
                    onChange={(e) =>
                      setBulkQuantity(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Price (for all variants)</Label>
                  <Input
                    type='number'
                    placeholder='Enter price'
                    value={bulkPrice}
                    onChange={(e) =>
                      setBulkPrice(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              <Button
                type='button'
                onClick={handleGenerateBulkVariants}
                disabled={
                  selectedColors.length === 0 ||
                  selectedSizes.length === 0 ||
                  bulkQuantity <= 0 ||
                  bulkPrice <= 0
                }
              >
                Generate Variants
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Individual Mode */}
        {variantMode === 'individual' && (
          <Card>
            <CardContent className='space-y-6'>
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-semibold'>Product Variants</h3>
                <Button
                  type='button'
                  onClick={handleAddIndividualVariant}
                  size='sm'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Variant
                </Button>
              </div>

              <div className='space-y-4'>
                {form.watch('variants')?.map((variant, index) => (
                  <div
                    key={index}
                    className='grid lg:grid-cols-5 grid-cols-1 gap-4 p-4 border rounded-lg'
                  >
                    <div className='space-y-2'>
                      <Label>Color</Label>
                      <SearchAndSelect
                        placeholder='Select color...'
                        search={async (query: string) => {
                          const colors = fetchAllColorsMutationData?.data || [];
                          const filtered = colors.filter((c) =>
                            c.name.toLowerCase().includes(query.toLowerCase())
                          );
                          return filtered.map((c) => ({
                            value: c.id,
                            label: c.name,
                          }));
                        }}
                        onSelect={(option) => {
                          const variants = form.getValues('variants');
                          variants[index].colorId = option.value;
                          variants[index].colorName = option.label;
                          form.setValue('variants', variants);
                        }}
                      />
                      {variant.colorName && (
                        <div className='text-xs text-muted-foreground'>
                          Selected: {variant.colorName}
                        </div>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label>Size</Label>
                      <SearchAndSelect
                        placeholder='Select size...'
                        search={async (query: string) => {
                          const sizes = fetchAllSizesMutationData?.data || [];
                          const filtered = sizes.filter((s) =>
                            s.name.toLowerCase().includes(query.toLowerCase())
                          );
                          return filtered.map((s) => ({
                            value: s.id,
                            label: s.name,
                          }));
                        }}
                        onSelect={(option) => {
                          const variants = form.getValues('variants');
                          variants[index].sizeId = option.value;
                          variants[index].sizeName = option.label;
                          form.setValue('variants', variants);
                        }}
                      />
                      {variant.sizeName && (
                        <div className='text-xs text-muted-foreground'>
                          Selected: {variant.sizeName}
                        </div>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label>Quantity</Label>
                      <Input
                        type='number'
                        placeholder='Qty'
                        value={variant.quantity}
                        onChange={(e) => {
                          const variants = form.getValues('variants');
                          variants[index].quantity =
                            parseInt(e.target.value) || 1;
                          form.setValue('variants', variants);
                        }}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>Price</Label>
                      <Input
                        type='number'
                        placeholder='Price'
                        value={variant.price}
                        onChange={(e) => {
                          const variants = form.getValues('variants');
                          variants[index].price =
                            parseFloat(e.target.value) || 0;
                          form.setValue('variants', variants);
                        }}
                      />
                    </div>

                    <div className='flex items-center'>
                      <Button
                        type='button'
                        variant='destructive'
                        size='sm'
                        onClick={() => handleRemoveVariant(index)}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                ))}

                {(!form.watch('variants') ||
                  form.watch('variants').length === 0) && (
                  <div className='text-center text-muted-foreground py-8'>
                    No variants added. Click &quot;Add Variant&quot; to start.
                  </div>
                )}
              </div>
              <FormMessage>
                {form.formState.errors.variants?.message}
              </FormMessage>
            </CardContent>
          </Card>
        )}

        {/* Display Generated Variants */}
        {form.watch('variants') && form.watch('variants').length > 0 && (
          <Card>
            <CardContent>
              <h3 className='text-lg font-semibold mb-4'>
                Generated Variants ({form.watch('variants').length})
              </h3>
              <div className='space-y-2 max-h-96 overflow-y-auto'>
                {form.watch('variants').map((variant, index) => (
                  <div
                    key={index}
                    className='flex justify-between items-center p-3 bg-secondary rounded-lg'
                  >
                    <div className='flex gap-4'>
                      <span className='font-medium'>
                        {variant.colorName} - {variant.sizeName}
                      </span>
                      <span className='text-muted-foreground'>
                        Qty: {variant.quantity}
                      </span>
                      <span className='text-muted-foreground'>
                        Price: AU${variant.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {form.formState.errors.variants && (
          <div className='text-sm text-red-500 font-medium'>
            {form.formState.errors.variants.message}
          </div>
        )}

        {/* Quantity Discounts */}
        <Card>
          <CardContent className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>
                Quantity Discounts (Optional)
              </h3>
              <Button
                type='button'
                onClick={handleAddQuantityDiscount}
                size='sm'
              >
                <Plus className='w-4 h-4 mr-2' />
                Add Discount
              </Button>
            </div>

            <div className='space-y-4'>
              {form.watch('quantityDiscounts')?.map((discount, index) => (
                <div
                  key={index}
                  className='grid lg:grid-cols-5 grid-cols-1 gap-4 p-4 border rounded-lg'
                >
                  <div className='space-y-2'>
                    <Label>Min Quantity</Label>
                    <Input
                      type='number'
                      placeholder='Min Qty'
                      value={discount.minQty}
                      onChange={(e) => {
                        const discounts =
                          form.getValues('quantityDiscounts') || [];
                        discounts[index].minQty = parseInt(e.target.value) || 1;
                        form.setValue('quantityDiscounts', discounts);
                      }}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Max Quantity</Label>
                    <Input
                      type='number'
                      placeholder='Max Qty'
                      value={discount.maxQty}
                      onChange={(e) => {
                        const discounts =
                          form.getValues('quantityDiscounts') || [];
                        discounts[index].maxQty = parseInt(e.target.value) || 1;
                        form.setValue('quantityDiscounts', discounts);
                      }}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Discount Amount</Label>
                    <Input
                      type='number'
                      placeholder='Amount'
                      value={discount.amount}
                      onChange={(e) => {
                        const discounts =
                          form.getValues('quantityDiscounts') || [];
                        discounts[index].amount =
                          parseFloat(e.target.value) || 0;
                        form.setValue('quantityDiscounts', discounts);
                      }}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Note (Optional)</Label>
                    <Input
                      type='text'
                      placeholder='Note'
                      value={discount.note || ''}
                      onChange={(e) => {
                        const discounts =
                          form.getValues('quantityDiscounts') || [];
                        discounts[index].note = e.target.value;
                        form.setValue('quantityDiscounts', discounts);
                      }}
                    />
                  </div>

                  <div className='flex items-end'>
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      onClick={() => handleRemoveQuantityDiscount(index)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              ))}

              {(!form.watch('quantityDiscounts') ||
                form.watch('quantityDiscounts')?.length === 0) && (
                <div className='text-center text-muted-foreground py-8'>
                  No quantity discounts added. Click &quot;Add Discount&quot; to
                  start.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <TextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='additionalDesc'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Additional Description</FormLabel>
                  <FormControl>
                    <TextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card>
            <CardContent className='space-y-6'>
              <FormField
                control={form.control}
                name='discountNote'
                render={({ field }) => (
                  <FormItem className='lg:col-span-3'>
                    <FormLabel>Discount Note</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter discount note here'
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='catalogId'
                render={({ field }) => (
                  <FormItem className='lg:col-span-3'>
                    <FormLabel>Catalog ID</FormLabel>
                    <FormControl>
                      <Input placeholder='catalog ID' {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex gap-4'>
                <FormField
                  control={form.control}
                  name='isNew'
                  render={({ field }) => (
                    <FormItem className='inline-block shrink-0'>
                      <div className=' flex gap-6 items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base'>
                            New Product
                          </FormLabel>
                          <div className='text-sm text-muted-foreground'>
                            Mark this product as new
                          </div>
                        </div>
                        <FormControl>
                          <input
                            type='checkbox'
                            checked={field.value || false}
                            onChange={field.onChange}
                            className='h-4 w-4 cursor-pointer'
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='flatDiscount'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>Flat Discount</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          defaultValue={field.value}
                          placeholder='Flat Discount'
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='space-y-6'>
              <FormField
                control={form.control}
                name='metaTitle'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter meta title' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='metaDescription'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter meta description'
                        className='resize-none'
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='metaKeyword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Keywords (Optional)</FormLabel>
                    <FormControl>
                      <MultiSelect
                        value={metaKeywords}
                        onChange={(selected) => {
                          const keywords = selected as Array<{
                            value: string;
                            label: string;
                          }>;
                          setMetaKeywords(keywords);
                          field.onChange(keywords.map((item) => item.value));
                        }}
                        options={metaKeywords}
                        placeholder='Type and press enter to add keywords...'
                        isCreatable={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 items-center gap-5  w-full'>
          <Card className='cursor-pointer'>
            <CardContent>
              <FormField
                control={form.control}
                name='featuredImage'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image</FormLabel>
                    <FormControl>
                      <div
                        onClick={() => setOpenFeaturedImage(true)}
                        className='cursor-pointer border-2 border-dashed rounded-lg p-6 hover:border-gray-400 transition-colors'
                      >
                        {featuredImage ? (
                          <div className='flex items-start gap-3'>
                            <div className='relative w-20 h-20 rounded-lg overflow-hidden border'>
                              <img
                                src={featuredImage.fileUrl}
                                alt={featuredImage.fileName}
                                className='w-full h-full object-cover'
                              />
                            </div>
                            <div className='flex-1'>
                              <p className='font-medium text-sm break-all'>
                                {featuredImage.fileName}
                              </p>
                              <p className='text-xs text-muted-foreground mt-1'>
                                Click to change image
                              </p>
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeaturedImageChange(null);
                              }}
                            >
                              <X className='w-4 h-4' />
                            </Button>
                          </div>
                        ) : (
                          <div className='flex flex-col items-center justify-center text-center'>
                            <FileImage className='w-12 h-12 text-muted-foreground mb-2' />
                            <p className='text-sm font-medium'>
                              Click to select featured image
                            </p>
                            <p className='text-xs text-muted-foreground mt-1'>
                              Choose from media library or upload new
                            </p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <FormField
                control={form.control}
                name='featuredImage'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternative Image</FormLabel>
                    <FormControl>
                      <div
                        onClick={() => setOpenAlternativeImage(true)}
                        className='cursor-pointer border-2 border-dashed rounded-lg p-6 hover:border-gray-400 transition-colors'
                      >
                        {alternativeImage ? (
                          <div className='flex items-start gap-3'>
                            <div className='relative w-20 h-20 rounded-lg overflow-hidden border'>
                              <img
                                src={alternativeImage.fileUrl}
                                alt={alternativeImage.fileName}
                                className='w-full h-full object-cover'
                              />
                            </div>
                            <div className='flex-1'>
                              <p className='font-medium text-sm break-all'>
                                {alternativeImage.fileName}
                              </p>
                              <p className='text-xs text-muted-foreground mt-1'>
                                Click to change image
                              </p>
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAlternativeImageChange(null);
                              }}
                            >
                              <X className='w-4 h-4' />
                            </Button>
                          </div>
                        ) : (
                          <div className='flex flex-col items-center justify-center text-center'>
                            <FileImage className='w-12 h-12 text-muted-foreground mb-2' />
                            <p className='text-sm font-medium'>
                              Click to select featured image
                            </p>
                            <p className='text-xs text-muted-foreground mt-1'>
                              Choose from media library or upload new
                            </p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <Card className='max-h-80 overflow-y-auto'>
          <CardContent>
            <FormLabel className='mb-3'>Gallery Images</FormLabel>
            <div className='flex flex-row flex-wrap gap-4'>
              {galleryImages && galleryImages.length > 0
                ? galleryImages.map((image) => (
                    <div
                      key={image.id}
                      className='relative w-32 h-32 rounded-lg overflow-hidden border'
                    >
                      <img
                        src={image.fileUrl}
                        alt={image.fileName}
                        className='w-full h-full object-cover'
                      />
                      <div
                        className='absolute top-1 right-1 p-1 bg-white rounded-full border-muted-foreground cursor-pointer 
                        hover:bg-red-500 hover:text-white transition-colors'
                        onClick={() =>
                          handleGalleryImagesChange(
                            galleryImages.filter((img) => img.id !== image.id)
                          )
                        }
                      >
                        <X className='w-3 h-3' />
                      </div>
                    </div>
                  ))
                : null}
              <div
                className='flex justify-center items-center size-32 bg-gray-100 
              rounded-md cursor-pointer hover:bg-gray-200 transition-colors'
                onClick={() => setOpenGalleryImages(true)}
              >
                <Plus className='w-12 h-12 text-muted-foreground' />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
      <Modal
        isOpen={openFeaturedImage}
        setIsOpen={setOpenFeaturedImage}
        title='Select Featured Image'
        description='Choose from media library or upload new'
      >
        <ProductFeaturedImage
          image={featuredImage}
          setImage={handleFeaturedImageChange}
          setIsOpen={setOpenFeaturedImage}
        />
      </Modal>
      <Modal
        isOpen={openAlternativeImage}
        setIsOpen={setOpenAlternativeImage}
        title='Select Alternative Image'
        description='Choose from media library or upload new'
      >
        <ProductFeaturedImage
          image={alternativeImage}
          setImage={handleAlternativeImageChange}
          setIsOpen={setOpenAlternativeImage}
        />
      </Modal>
      <Modal
        isOpen={openGalleryImages}
        setIsOpen={setOpenGalleryImages}
        title='Select gallery Image'
        description='Choose from media library or upload new'
      >
        <ProductGalleryImage
          image={galleryImages}
          setImage={handleGalleryImagesChange}
          setIsOpen={setOpenGalleryImages}
        />
      </Modal>
    </Form>
  );
}
