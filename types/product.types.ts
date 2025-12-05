import { CategoryType, SubCategoryType } from './categories.types';
import { ColorType } from './colors.types';
import { MediaType } from './media.types';
import { SizeType } from './size.types';

export type ProductVariantType = {
  id: number;
  productId: number;
  colorId: number;
  sizeId: number;
  color: ColorType;
  size: SizeType;
  quantity: number;
  price: number;
};

export type GalleryType = {
  id: number;
  productId: number;
  mediaId: number;
  media: MediaType;
};

export type QuantityDiscountType = {
  id: number;
  productId: number;
  minQty: number;
  maxQty: number;
  amount: number;
  note?: string;
};

export type ImageType = {
  fileUrl: string;
  fileName: string;
};

export type GalleryImageType = {
  media: {
    title: string;
    alt: string;
    fileUrl: string;
    fileName: string;
  };
};

export type ProductType = {
  id: number;
  title: string;
  catalogId: string | null;
  shortDescription: string;
  description: string;
  additionalDesc: string;
  discountNote?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeyword?: string;
  productType: string;
  twoSidePrice: number | null;
  isNew: boolean;
  isActive: boolean;
  slug: string;
  mainImage: MediaType;
  alternativeImage?: MediaType | null;
  category: CategoryType;
  subCategory: SubCategoryType;
  variants: ProductVariantType[];
  // gallery: GalleryImageType[];
  createdAt: string;
  updatedAt: string;
  quantityDiscounts: QuantityDiscountType[];
  minPrice: number;
  maxPrice: number;
  quantity: number;
  inStock: boolean;
};

export type CreateProductType = {
  title: string;
  catalogId?: string;
  shortDescription: string;
  description: string;
  additionalDesc: string;
  discountNote?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeyword?: string[];
  twoSidePrice?: number | null;
  isNew?: boolean;
  slug: string;
  featuredImage: ImageType | null;
  alternativeImage?: ImageType | null;
  category: {
    id: number;
    name: string;
  } | null;
  subCategory?: {
    id: number;
    name: string;
  } | null;
  variants: {
    colorId: number;
    sizeId: number;
    price: number;
  }[];
  galleryImages?: ImageType[];
  quantityDiscounts?: {
    minQty: number;
    maxQty: number;
    amount: number;
    note?: string;
  }[];
};
