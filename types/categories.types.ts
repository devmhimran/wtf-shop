export type CategoryType = {
  id: number;
  name: string;
  slug: string;
  _count?: {
    subcategories: number;
    products: number;
  };
};

export type CreateCategoryType = {
  name: string;
  slug: string;
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
