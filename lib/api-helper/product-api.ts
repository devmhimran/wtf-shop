import { CategoryType, CreateCategoryType, Meta, Response } from '@/types';
import { axiosInstanceWithAuth } from '../axios';

export const productApi = {
  categories: {
    getCategories: (params?: string) => {
      const url = '/protected/categories' + (params ? params : '');
      return axiosInstanceWithAuth.get<Response<CategoryType[], Meta>>(url);
    },
    createCategory: (data: CreateCategoryType) => {
      const url = '/protected/categories';
      return axiosInstanceWithAuth.post(url, data);
    },
    updateCategory: (slug: string, updateData: Partial<CreateCategoryType>) => {
      const url = `/protected/categories/${slug}`;
      return axiosInstanceWithAuth.put(url, updateData);
    },
    deleteCategory: (slug: string) => {
      const url = `/protected/categories/${slug}`;
      return axiosInstanceWithAuth.delete(url);
    },
  },
};
