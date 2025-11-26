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
