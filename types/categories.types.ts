import { MediaType } from './media.types';

export type CategoryType = {
  id: number;
  name: string;
  slug: string;
  imageId?: number | null;
  image?: MediaType | null;
  _count?: {
    subcategories: number;
    products: number;
  };
};

export type CreateCategoryType = {
  name: string;
  slug: string;
  imageId?: number | null;
};

export type CreateSubCategoryType = {
  name?: string;
  slug?: string;
  categoryId?: number;
};

export type SubCategoryType = {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  category?: CategoryType;
  _count?: {
    products: number;
  };
};

export type PublicCategoryType = {
  id: number;
  name: string;
  slug: string;
  image: MediaType | null;
};
