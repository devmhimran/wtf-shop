import { CategoryType, SubCategoryType } from './categories.types';
import { ColorType } from './colors.types';
import { MediaType } from './media.types';
import { SizeType } from './size.types';

export type ProductTypeTypes = 'STANDARD' | 'CUSTOM';

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
  twoSidePrice: number | null;
  isNew: boolean;
  isActive: boolean;
  flatDiscount: number;
  slug: string;
  mainImage: MediaType;
  productType: ProductTypeTypes;
  alternativeImage?: MediaType | null;
  category: CategoryType;
  subCategory: SubCategoryType;
  variants: ProductVariantType[];
  gallery: {
    media: MediaType;
  }[];
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
  flatDiscount?: number;
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
    note?: string | null;
  }[];
};

export type PublicProductType = {
  id: number;
  title: string;
  slug: string;
  mainImage: MediaType;
  alternativeImage?: MediaType | null;
  category: {
    name: string;
    slug: string;
  };
  flatDiscount: number;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
};

export type PublicProductDetailsType = {
  id: number;
  title: string;
  slug: string;
  description: string;
  additionalDesc: string;
  shortDescription: string;
  flatDiscount: number;
  twoSidePrice: number | null;
  catalogId: string | null;
  categoryId: number;
  subCategoryId: number | null;
  createdAt: string;
  updatedAt: string;
  category: Omit<CategoryType, '_count' | 'image'>;
  subCategory: Omit<SubCategoryType, '_count'> | null;
  mainImage: MediaType;
  alternativeImage?: MediaType | null;
  productType: ProductTypeTypes;
  variants: {
    id: number;
    price: number;
    quantity: number;
    color: {
      id: number;
      name: string;
    };
    size: {
      id: number;
      name: string;
    };
  }[];
  quantityDiscounts: QuantityDiscountType[];
  gallery: {
    media: MediaType;
  }[];
  minPrice: number;
  maxPrice: number;
  quantity: number;
  inStock: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeyword: string | null;
};
