'use client';

import { ProductDetailSkeleton } from '@/components/skeletons';
import { useGetSinglePublicProductBySlug } from '@/hooks';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/autoplay';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import Image from 'next/image';
import { LightBox } from '@/components/shared';
import { MediaType } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImagePlus, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { RelatedProducts } from './related-products';
import { ProductDescription } from './product-description';
import { useCartStore } from '@/store/useCart';
import { Badge } from '@/components/ui/badge';

interface CustomizationItem {
  id: string;
  image: File | null;
  imagePreview: string;
  note: string;
}

export function ProductDetailsContent() {
  const { slug } = useParams();
  const { addItem } = useCartStore();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPrintSide, setSelectedPrintSide] = useState<'one' | 'two'>(
    'one'
  );
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [colorError, setColorError] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [sizeQuantities, setSizeQuantities] = useState<{
    [size: string]: number;
  }>({});
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizations, setCustomizations] = useState<CustomizationItem[]>([]);

  const {
    fetchSinglePublicProductMutationData,
    fetchSinglePublicProductMutation,
  } = useGetSinglePublicProductBySlug(slug as string);

  const product = fetchSinglePublicProductMutationData?.data;

  // Get unique colors and sizes from variants
  const getAvailableColors = () => {
    if (!product?.variants) return [];
    const colors = Array.from(
      new Set(product.variants.map((v) => v.color.name))
    );
    return colors;
  };

  const getAvailableSizes = (color?: string) => {
    if (!product?.variants) return [];
    const filteredVariants = color
      ? product.variants.filter((v) => v.color.name === color)
      : product.variants;
    const sizes = Array.from(new Set(filteredVariants.map((v) => v.size.name)));
    return sizes;
  };

  // Customization functions
  const addCustomizationItem = () => {
    const newItem: CustomizationItem = {
      id: Date.now().toString(),
      image: null,
      imagePreview: '',
      note: '',
    };
    setCustomizations([...customizations, newItem]);
  };

  const removeCustomizationItem = (id: string) => {
    setCustomizations(customizations.filter((item) => item.id !== id));
  };

  const updateCustomizationItem = (
    id: string,
    field: keyof CustomizationItem,
    value: File | string | null
  ) => {
    setCustomizations(
      customizations.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleImageUpload = (id: string, file: File) => {
    if (file.size > 1024 * 1024) {
      toast.error('Image size must be less than 1MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updateCustomizationItem(id, 'image', file);
      updateCustomizationItem(id, 'imagePreview', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const mainImageData = product?.mainImage;
  const galleryImagesData = product?.gallery.map((image) => image.media);
  const combinedGalleryData = galleryImagesData
    ? [mainImageData, ...galleryImagesData]
    : [mainImageData];

  const openLightbox = (index: number) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  // const lightBoxImages = combinedGalleryData.map(
  //   (image: MediaType, index: number) => ({
  //     src:
  //       image.fileUrl ||
  //       '/assets/img/placeholder-image.png',
  //     alt: `product-image-${index}`,
  //     loading: 'lazy',
  //   })
  // );

  const lightBoxImages = combinedGalleryData.map((image) => ({
    src: image?.fileUrl || '/assets/img/placeholder-image.png',
    alt: image?.alt || image?.alt || image?.fileName || 'product-image',
    loading: 'lazy',
  }));

  // Get current price based on selected variant
  const getCurrentPrice = (): number => {
    if (!product?.variants || !selectedColor || !selectedSize) {
      return product?.minPrice || 0;
    }

    const matchingVariant = product.variants.find(
      (v) => v.color.name === selectedColor && v.size.name === selectedSize
    );

    return matchingVariant ? matchingVariant.price : product.minPrice || 0;
  };

  // Calculate applicable discount
  const getApplicableDiscount = (totalQuantity: number) => {
    if (!product?.quantityDiscounts || product.quantityDiscounts.length === 0) {
      return null;
    }

    const applicableDiscounts = product.quantityDiscounts.filter((discount) => {
      const minQty = discount.minQty;
      const maxQty = discount.maxQty;
      return maxQty
        ? totalQuantity >= minQty && totalQuantity <= maxQty
        : totalQuantity >= minQty;
    });

    if (applicableDiscounts.length === 0) return null;

    return applicableDiscounts.reduce((max, current) =>
      current.amount > max.amount ? current : max
    );
  };

  const getTotalPrice = () => {
    if (!product) return '0.00';

    let total = 0;
    let totalQuantity = 0;

    Object.entries(sizeQuantities).forEach(([size, qty]) => {
      if (qty > 0) {
        totalQuantity += qty;

        const matchingVariant = product.variants.find(
          (v) => v.color.name === selectedColor && v.size.name === size
        );

        let itemPrice = matchingVariant
          ? matchingVariant.price
          : product.minPrice || 0;

        if (selectedPrintSide === 'two' && product.twoSidePrice) {
          itemPrice += product.twoSidePrice;
        }

        total += itemPrice * qty;
      }
    });

    if (totalQuantity > 0) {
      const applicableDiscount = getApplicableDiscount(totalQuantity);
      if (applicableDiscount) {
        total = total - applicableDiscount.amount;
      }
    }

    if (product.flatDiscount && product.flatDiscount > 0) {
      const flatDiscountAmount = (total * product.flatDiscount) / 100;
      total = total - flatDiscountAmount;
    }

    return total.toFixed(2);
  };

  const addStandardToCart = async () => {
    if (!product) return;

    if (!selectedColor) {
      setColorError(true);
      toast.error('Please select a color');
      return;
    }
    if (!selectedSize) {
      setSizeError(true);
      toast.error('Please select a size');
      return;
    }

    const payload = {
      productId: product.id,
      slug: product.slug,
      quantity: quantity,
      image:
        combinedGalleryData[photoIndex]?.fileUrl ||
        '/assets/img/placeholder-image.png',
      color: selectedColor,
      size: selectedSize,
      printSide: 'one' as const,
    };

    // Add to Zustand cart store
    addItem(payload);
    toast.success('Added to cart!');

    // Reset fields
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
    setColorError(false);
    setSizeError(false);
  };

  // Add custom product to cart
  const handleAddToCart = async () => {
    if (!product) return;

    const totalQuantity = Object.values(sizeQuantities).reduce(
      (sum, qty) => sum + qty,
      0
    );

    if (totalQuantity < 10) {
      toast.error(
        'Please add at least 10 products in total (e.g. S-3, M-4, L-2, XL-1)'
      );
      return;
    }

    if (!selectedColor) {
      setColorError(true);
      toast.error('Please select a color');
      return;
    }

    const sizesToAdd = Object.entries(sizeQuantities).filter(
      ([, qty]) => qty > 0
    );

    if (sizesToAdd.length === 0) {
      toast.error('Please select at least one size and quantity');
      return;
    }

    if (customizations.length > 0) {
      const emptyNoteCustomizations = customizations.filter(
        (item) => !item.note.trim()
      );
      if (emptyNoteCustomizations.length > 0) {
        toast.error(
          'Please add notes for all customizations before adding to cart'
        );
        return;
      }
    }

    // Transform customizations once (same for all sizes)
    const serializableCustomizations = customizations.map((item) => ({
      id: item.id,
      imagePreview: item.imagePreview, // base64 string
      imageName: item.image?.name || '',
      imageSize: item.image?.size || 0,
      imageType: item.image?.type || '',
      note: item.note,
    }));

    // Prepare all payloads
    const allPayloads = sizesToAdd.map(([size, qty]) => ({
      productId: product.id,
      slug: product.slug,
      quantity: qty,
      image:
        combinedGalleryData[photoIndex]?.fileUrl ||
        '/assets/img/placeholder-image.png',
      color: selectedColor,
      size: size,
      printSide: selectedPrintSide,
      customizations: serializableCustomizations,
    }));

    // Add all items to cart
    allPayloads.forEach((payload) => {
      addItem(payload);
    });

    toast.success(`Successfully added ${sizesToAdd.length} variant(s) to cart`);

    // Reset fields
    setSelectedColor('');
    setSizeQuantities({});
    setSelectedPrintSide('one');
    setCustomizations([]);
    setShowCustomization(false);
    setColorError(false);
    setSizeError(false);
  };

  const handleContactForOrder = () => {
    toast.info('Contact functionality coming soon!');
  };

  return fetchSinglePublicProductMutation.isLoading ? (
    <ProductDetailSkeleton />
  ) : !product ? (
    <div className='w-full md:w-8/12 mx-auto pt-16 md:px-0 px-2'>
      <div className='text-center py-20'>
        <h1 className='text-3xl text-gray-500'>Product not found</h1>
      </div>
    </div>
  ) : (
    <div className='w-full md:w-8/12 mx-auto pt-16 md:px-0 px-2'>
      <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-16'>
        <div className=''>
          <Image
            width={500}
            height={500}
            src={
              combinedGalleryData[photoIndex]?.fileUrl ||
              '/assets/img/placeholder-image.png'
            }
            alt={combinedGalleryData[photoIndex]?.alt || product?.title}
            onClick={() => openLightbox(photoIndex)}
            className='cursor-pointer w-full'
          />

          <div className='mt-4'>
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              spaceBetween={25}
              slidesPerView={4}
              navigation
            >
              {combinedGalleryData?.map(
                (image: MediaType | undefined, index: number) => (
                  <SwiperSlide key={index} onClick={() => setPhotoIndex(index)}>
                    <Image
                      width={132}
                      height={132}
                      src={
                        image?.fileUrl || '/assets/img/placeholder-image.png'
                      }
                      alt={product?.title}
                      className={cn(
                        index !== photoIndex && 'opacity-40',
                        'cursor-pointer object-cover w-32 h-32 mx-auto'
                      )}
                    />
                  </SwiperSlide>
                )
              )}
            </Swiper>
          </div>
        </div>
        <div className='flex flex-col gap-6'>
          <h2 className='text-5xl'>{product.title}</h2>
          <p className='text-gray-500 text-lg'>
            Tax included. Shipping calculated at checkout.
          </p>
          {!product.inStock && (
            <Badge variant='destructive'>Out of Stock</Badge>
          )}
          <div>
            <p className='text-4xl'>
              AU$
              {product.productType === 'STANDARD'
                ? (() => {
                    if (!selectedColor || !selectedSize || quantity === 0) {
                      // Show price range if no selection
                      return product.minPrice === product.maxPrice
                        ? product.minPrice.toFixed(2)
                        : `${product.minPrice.toFixed(
                            2
                          )} - ${product.maxPrice.toFixed(2)}`;
                    }

                    // Calculate total price with discounts
                    const basePrice = getCurrentPrice();
                    const totalQuantity = quantity;
                    let total = basePrice * totalQuantity;

                    const applicableDiscount =
                      getApplicableDiscount(totalQuantity);
                    if (applicableDiscount) {
                      total = total - applicableDiscount.amount;
                    }

                    if (product.flatDiscount && product.flatDiscount > 0) {
                      const flatDiscountAmount =
                        (total * product.flatDiscount) / 100;
                      total = total - flatDiscountAmount;
                    }

                    return total.toFixed(2);
                  })()
                : (() => {
                    const totalQty = Object.values(sizeQuantities).reduce(
                      (sum, qty) => sum + qty,
                      0
                    );

                    if (totalQty === 0) {
                      // Show lowest price initially
                      let lowestPrice = product.minPrice || 0;

                      // Add print side price to lowest price
                      if (selectedPrintSide === 'two' && product.twoSidePrice) {
                        lowestPrice += product.twoSidePrice;
                      }

                      return lowestPrice.toFixed(2);
                    }

                    return getTotalPrice();
                  })()}
            </p>

            {/* STANDARD Product Price Breakdown */}
            {product.productType === 'STANDARD' &&
              selectedColor &&
              selectedSize &&
              quantity > 0 &&
              (() => {
                const basePrice = getCurrentPrice();
                const totalQuantity = quantity;
                const baseTotal = basePrice * totalQuantity;
                const applicableDiscount = getApplicableDiscount(totalQuantity);

                let finalTotal = baseTotal;
                let flatDiscountAmount = 0;

                if (applicableDiscount) {
                  finalTotal = finalTotal - applicableDiscount.amount;
                }

                if (product.flatDiscount && product.flatDiscount > 0) {
                  flatDiscountAmount =
                    (finalTotal * product.flatDiscount) / 100;
                  finalTotal = finalTotal - flatDiscountAmount;
                }

                const hasAnyDiscount =
                  applicableDiscount ||
                  (product.flatDiscount && product.flatDiscount > 0);

                // Only show breakdown if there are discounts or multiple quantities
                if (!hasAnyDiscount && totalQuantity === 1) return null;

                return (
                  <div className='mt-2 space-y-1 text-sm'>
                    {totalQuantity > 1 && (
                      <div className='flex items-center justify-between text-gray-600'>
                        <span>Total Quantity:</span>
                        <span className='font-medium'>
                          {totalQuantity} items
                        </span>
                      </div>
                    )}

                    <div className='flex items-center justify-between text-gray-600'>
                      <span>Base Price:</span>
                      <span>AU${baseTotal.toFixed(2)}</span>
                    </div>

                    {applicableDiscount && (
                      <div className='flex items-center justify-between text-green-600 font-medium'>
                        <span>Quantity Discount:</span>
                        <span>-AU${applicableDiscount.amount.toFixed(2)}</span>
                      </div>
                    )}

                    {typeof product.flatDiscount === 'number' &&
                      product.flatDiscount > 0 && (
                        <div className='flex items-center justify-between text-green-600 font-medium'>
                          <span>Flat Discount ({product.flatDiscount}%):</span>
                          <span>-AU${flatDiscountAmount.toFixed(2)}</span>
                        </div>
                      )}

                    {typeof hasAnyDiscount === 'boolean' && hasAnyDiscount && (
                      <div className='border-t pt-1'>
                        <div className='flex items-center justify-between text-lg font-semibold text-gray-900'>
                          <span>Final Price:</span>
                          <span>AU${finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            {/* CUSTOM Product Price Breakdown */}
            {product.productType === 'CUSTOM' &&
              Object.values(sizeQuantities).reduce(
                (sum, qty) => sum + qty,
                0
              ) === 0 && (
                <span className='text-sm text-gray-500'>Starting Price</span>
              )}

            {product.productType === 'CUSTOM' &&
              (() => {
                const totalQty = Object.values(sizeQuantities).reduce(
                  (sum, qty) => sum + qty,
                  0
                );

                if (totalQty === 0) return null;

                let baseTotal = 0;
                let printSideTotal = 0;

                // Calculate base price and print side separately
                Object.entries(sizeQuantities).forEach(([size, qty]) => {
                  if (qty > 0) {
                    const matchingVariant = product.variants.find(
                      (v) =>
                        v.color.name === selectedColor && v.size.name === size
                    );
                    const itemPrice = matchingVariant
                      ? matchingVariant.price
                      : product.minPrice || 0;

                    baseTotal += itemPrice * qty;

                    // Add print side price separately
                    if (selectedPrintSide === 'two' && product.twoSidePrice) {
                      printSideTotal += product.twoSidePrice * qty;
                    }
                  }
                });

                const originalTotal = baseTotal + printSideTotal;
                const applicableDiscount = getApplicableDiscount(totalQty);
                let finalTotal = originalTotal;
                let flatDiscountAmount = 0;

                if (applicableDiscount) {
                  finalTotal = finalTotal - applicableDiscount.amount;
                }

                if (product.flatDiscount && product.flatDiscount > 0) {
                  flatDiscountAmount =
                    (finalTotal * product.flatDiscount) / 100;
                  finalTotal = finalTotal - flatDiscountAmount;
                }

                const hasAnyDiscount =
                  applicableDiscount ||
                  (typeof product.flatDiscount === 'number' &&
                    product.flatDiscount > 0);

                return (
                  <div className='mt-2 space-y-1 text-sm'>
                    <div className='flex items-center justify-between text-gray-600'>
                      <span>Total Quantity:</span>
                      <span className='font-medium'>{totalQty} items</span>
                    </div>

                    <div className='flex items-center justify-between text-gray-600'>
                      <span>Base Price:</span>
                      <span>AU${baseTotal.toFixed(2)}</span>
                    </div>

                    {selectedPrintSide === 'two' &&
                      product.twoSidePrice &&
                      printSideTotal > 0 && (
                        <div className='flex items-center justify-between text-gray-600'>
                          <span>Print Side (Back):</span>
                          <span>+AU${printSideTotal.toFixed(2)}</span>
                        </div>
                      )}

                    <div className='flex items-center justify-between text-gray-700 font-medium border-t pt-1'>
                      <span>Subtotal:</span>
                      <span>AU${originalTotal.toFixed(2)}</span>
                    </div>

                    {applicableDiscount && (
                      <div className='flex items-center justify-between text-green-600 font-medium'>
                        <span>Quantity Discount:</span>
                        <span>-AU${applicableDiscount.amount.toFixed(2)}</span>
                      </div>
                    )}

                    {typeof product.flatDiscount === 'number' &&
                      product.flatDiscount > 0 && (
                        <div className='flex items-center justify-between text-green-600 font-medium'>
                          <span>Flat Discount ({product.flatDiscount}%):</span>
                          <span>-AU${flatDiscountAmount.toFixed(2)}</span>
                        </div>
                      )}

                    {hasAnyDiscount && (
                      <div className='border-t pt-1'>
                        <div className='flex items-center justify-between text-lg font-semibold text-gray-900'>
                          <span>Final Price:</span>
                          <span>AU${finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            {product.productType === 'CUSTOM' &&
              typeof product.twoSidePrice === 'number' &&
              product.twoSidePrice > 0 && (
                <p className='text-sm text-gray-500 mt-2'>
                  Print side pricing: Front (+AU$0) | Back (+AU$
                  {product.twoSidePrice.toFixed(2)})
                </p>
              )}
          </div>
          <div>
            {product.shortDescription && (
              <div
                className={cn('text-gray-500 w-full md:w-8/12 font-light')}
                dangerouslySetInnerHTML={{
                  __html: product.shortDescription,
                }}
              />
            )}
          </div>
          <div>
            {product.productType === 'CUSTOM' && (
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium'>Print Options:</label>
                <div className='flex gap-2'>
                  <Button
                    variant={
                      selectedPrintSide === 'one' ? 'default' : 'outline'
                    }
                    onClick={() => setSelectedPrintSide('one')}
                    className='flex-1'
                    type='button'
                  >
                    Front
                    {/* {product.data.attributes.one_side_price > 0 && (
                    <span className='ml-2 text-sm text-gray-500'>
                      (+AU${product.data.attributes.one_side_price})
                    </span>
                  )} */}
                    <span
                      className={cn(
                        selectedPrintSide === 'one'
                          ? 'text-green-400'
                          : 'text-gray-500',
                        'ml-1 text-sm'
                      )}
                    >
                      (+AU$0)
                    </span>
                  </Button>
                  <Button
                    variant={
                      selectedPrintSide === 'two' ? 'default' : 'outline'
                    }
                    onClick={() => setSelectedPrintSide('two')}
                    className='flex-1'
                    type='button'
                  >
                    Back
                    {(product.twoSidePrice || 0) > 0 && (
                      <span
                        className={cn(
                          selectedPrintSide === 'two'
                            ? 'text-green-400'
                            : 'text-gray-500',
                          'ml-1 text-sm'
                        )}
                      >
                        (+AU${product.twoSidePrice})
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className='flex flex-col items-center md:flex-row gap-4'>
            {product.productType !== 'CUSTOM' && (
              <div className='w-full'>
                {getAvailableColors().length > 0 && (
                  <Select
                    onValueChange={(value) => {
                      setColorError(false);
                      setSelectedColor(value);
                      setSelectedSize('');
                    }}
                    value={selectedColor}
                  >
                    <SelectTrigger className='w-full rounded-none text-base'>
                      <SelectValue placeholder='Select Color' />
                    </SelectTrigger>
                    <SelectContent className='z-9999 font-oswald rounded-none'>
                      {getAvailableColors().map((color) => (
                        <SelectItem
                          key={color}
                          value={color}
                          className='cursor-pointer'
                        >
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {colorError && (
                  <p className='text-red-400 text-sm mt-1'>
                    Please select color
                  </p>
                )}
              </div>
            )}

            {product.productType !== 'CUSTOM' && (
              <div className='w-full'>
                <Select
                  onValueChange={(value) => {
                    setSizeError(false);
                    setSelectedSize(value);
                  }}
                  value={selectedSize}
                  disabled={!selectedColor}
                >
                  <SelectTrigger className='w-full rounded-none text-base'>
                    <SelectValue placeholder='Select Size' />
                  </SelectTrigger>
                  <SelectContent className='z-9999 font-oswald rounded-none'>
                    {getAvailableSizes(selectedColor).map((size) => (
                      <SelectItem
                        key={size}
                        value={size}
                        className='cursor-pointer'
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sizeError && (
                  <p className='text-red-400 text-sm mt-1'>
                    Please select Size
                  </p>
                )}
              </div>
            )}

            {product.productType !== 'CUSTOM' && (
              <div className='w-full'>
                <div className='flex gap-4 items-end'>
                  <div>
                    <input
                      type='number'
                      min='1'
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                      className='w-20 px-3 py-2 border rounded'
                    />
                  </div>
                </div>
              </div>
            )}

            {product.productType === 'CUSTOM' && (
              <div className='w-full'>
                <Select
                  onValueChange={(value) => {
                    setColorError(false);
                    setSelectedColor(value);

                    const sizesForNewColor = getAvailableSizes(value);
                    const newQuantities: { [size: string]: number } = {};
                    sizesForNewColor.forEach((size: string) => {
                      newQuantities[size] = 0;
                    });
                    setSizeQuantities(newQuantities);
                  }}
                  value={selectedColor}
                >
                  <SelectTrigger className='w-full rounded-none text-base'>
                    <SelectValue placeholder='Select Color' />
                  </SelectTrigger>
                  <SelectContent className='z-9999 font-oswald rounded-none'>
                    {getAvailableColors().map((color) => (
                      <SelectItem
                        key={color}
                        value={color}
                        className='cursor-pointer'
                      >
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {colorError && (
                  <p className='text-red-400 text-sm mt-1'>
                    Please select color
                  </p>
                )}
              </div>
            )}
          </div>

          {product.productType === 'CUSTOM' && selectedColor && (
            <div className='mt-4'>
              <h3 className='text-lg font-medium mb-3'>
                Select Quantities by Size:
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {getAvailableSizes(selectedColor).map((size) => (
                  <div key={size} className='flex flex-col gap-2'>
                    <label className='text-sm font-medium'>{size}</label>
                    <input
                      type='number'
                      min='0'
                      value={sizeQuantities[size] || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setSizeQuantities((prev) => ({
                          ...prev,
                          [size]: value,
                        }));
                      }}
                      className='w-full px-3 py-2 border rounded'
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.productType === 'CUSTOM' && (
            <div className='border-t pt-6 mt-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold'>Product Customization</h3>
                <Button
                  onClick={() => {
                    setShowCustomization(!showCustomization);
                    if (!showCustomization && customizations.length === 0) {
                      addCustomizationItem();
                    }
                  }}
                  variant='outline'
                  className='flex items-center gap-2'
                  aria-label='Toggle product customization options'
                  type='button'
                >
                  <ImagePlus aria-hidden='true' size={16} />
                  {showCustomization
                    ? 'Hide Customization'
                    : 'Add Customization'}
                </Button>
              </div>

              {showCustomization && (
                <div className='space-y-4'>
                  {customizations.map((item, index) => (
                    <div
                      key={item.id}
                      className='border rounded-lg p-4 bg-gray-50 relative'
                    >
                      <div className='flex justify-between items-center mb-3'>
                        <h4 className='font-medium'>
                          Customization {index + 1}
                        </h4>
                        <button
                          onClick={() => removeCustomizationItem(item.id)}
                          className='text-red-500 hover:text-red-700 p-1'
                          aria-label={`Remove customization ${index + 1}`}
                          type='button'
                        >
                          <X size={20} aria-hidden='true' />
                        </button>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Image Upload */}
                        <div>
                          <label
                            htmlFor={`image-upload-${item.id}`}
                            className='block text-sm font-medium mb-2'
                          >
                            Upload Image
                          </label>
                          <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors relative'>
                            {item.imagePreview ? (
                              <div className='relative'>
                                <Image
                                  src={item.imagePreview}
                                  alt={`Customization ${index + 1}`}
                                  className='max-w-full h-32 object-cover mx-auto rounded'
                                  width={128}
                                  height={128}
                                />

                                <button
                                  onClick={() => {
                                    updateCustomizationItem(
                                      item.id,
                                      'image',
                                      null
                                    );
                                    updateCustomizationItem(
                                      item.id,
                                      'imagePreview',
                                      ''
                                    );
                                  }}
                                  className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm'
                                  aria-label='Remove image'
                                  type='button'
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className='relative'>
                                <ImagePlus className='mx-auto text-gray-400 text-3xl mb-2' />
                                <p className='text-gray-500 text-sm'>
                                  Click to upload image
                                </p>
                                <input
                                  id={`image-upload-${item.id}`}
                                  type='file'
                                  accept='image/*'
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUpload(item.id, file);
                                    }
                                  }}
                                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                                  aria-label={`Upload image for customization ${
                                    index + 1
                                  }`}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Note Field */}
                        <div>
                          <label
                            htmlFor={`note-${item.id}`}
                            className='block text-sm font-medium mb-2'
                          >
                            Customization Notes
                          </label>
                          <textarea
                            id={`note-${item.id}`}
                            value={item.note}
                            onChange={(e) =>
                              updateCustomizationItem(
                                item.id,
                                'note',
                                e.target.value
                              )
                            }
                            placeholder='Add any special instructions or notes for this customization...'
                            className='w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent'
                            aria-label={`Notes for customization ${index + 1}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Another Customization Button */}
                  <Button
                    onClick={addCustomizationItem}
                    variant='outline'
                    className='w-full border-dashed border-2 border-gray-300 hover:border-gray-400'
                    aria-label='Add another customization'
                    type='button'
                  >
                    <Plus className='mr-2' aria-hidden='true' />
                    Add Another Customization
                  </Button>

                  {/* Customization Summary */}
                  {customizations.length > 0 && (
                    <div className='bg-blue-50 p-4 rounded-lg'>
                      <p className='text-sm text-blue-800'>
                        <strong>Customizations Added:</strong>{' '}
                        {customizations.length}
                        {customizations.filter((item) => item.image).length >
                          0 &&
                          ` (${
                            customizations.filter((item) => item.image).length
                          } with images)`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className='flex gap-4 mt-6'>
            <div className='w-full'>
              {product.productType === 'CUSTOM' &&
              Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0) >
                100 ? (
                <Button
                  onClick={handleContactForOrder}
                  className='flex items-center gap-2.5 w-full h-full rounded-full bg-blue-500 hover:bg-blue-600'
                  aria-label='Contact for pricing'
                  type='button'
                >
                  <span className='text-lg'>Contact for Pricing</span>
                </Button>
              ) : (
                product.productType === 'CUSTOM' && (
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className='flex items-center gap-2.5 w-full h-full rounded-full bg-orange-400 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    aria-label={`Add ${product.title} to cart`}
                    type='button'
                  >
                    <span className='text-lg'>Add to cart</span>
                  </Button>
                )
              )}
              {product.productType !== 'CUSTOM' && (
                <Button
                  onClick={addStandardToCart}
                  disabled={!product.inStock}
                  className='flex items-center gap-2.5 w-full h-full rounded-full bg-orange-400 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  aria-label={`Add ${product.title} to cart`}
                  type='button'
                >
                  <span className='text-lg'>Add to cart</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductDescription data={product} />
      <RelatedProducts />

      <LightBox
        isOpen={isOpen}
        close={() => setIsOpen(false)}
        images={lightBoxImages}
        currentImageIndex={photoIndex}
        setCurrentImageIndex={setPhotoIndex}
      />
    </div>
  );
}
