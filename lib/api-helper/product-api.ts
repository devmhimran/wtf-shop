import {
  CategoryType,
  ColorType,
  CreateCategoryType,
  CreateColorsType,
  CreatePromoCodeType,
  CreateShippingChargeType,
  CreateSizesType,
  CreateSubCategoryType,
  Meta,
  PromoCodeType,
  Response,
  ShippingChargeType,
  SizeType,
  SubCategoryType,
} from '@/types';
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
  subCategories: {
    getSubCategories: (params?: string) => {
      const url = '/protected/subcategories' + (params ? params : '');
      return axiosInstanceWithAuth.get<Response<SubCategoryType[], Meta>>(url);
    },
    createSubCategory: (data: CreateSubCategoryType) => {
      const url = '/protected/subcategories';
      return axiosInstanceWithAuth.post(url, data);
    },
    updateSubCategory: (
      slug: string,
      updateData: Partial<CreateSubCategoryType>
    ) => {
      const url = `/protected/subcategories/${slug}`;
      return axiosInstanceWithAuth.put(url, updateData);
    },
    deleteSubCategory: (slug: string) => {
      const url = `/protected/subcategories/${slug}`;
      return axiosInstanceWithAuth.delete(url);
    },
  },
  colors: {
    getColors: (params?: string) => {
      const url = '/protected/colors' + (params ? params : '');
      return axiosInstanceWithAuth.get<Response<ColorType[], Meta>>(url);
    },
    createColor: (data: CreateColorsType) => {
      const url = '/protected/colors';
      return axiosInstanceWithAuth.post(url, data);
    },
    updateColor: (id: number, updateData: Partial<CreateColorsType>) => {
      const url = `/protected/colors/${id}`;
      return axiosInstanceWithAuth.put(url, updateData);
    },
    deleteColor: (id: number) => {
      const url = `/protected/colors/${id}`;
      return axiosInstanceWithAuth.delete(url);
    },
  },
  sizes: {
    getSizes: (params?: string) => {
      const url = '/protected/sizes' + (params ? params : '');
      return axiosInstanceWithAuth.get<Response<SizeType[], Meta>>(url);
    },
    createSize: (data: CreateSizesType) => {
      const url = '/protected/sizes';
      return axiosInstanceWithAuth.post(url, data);
    },
    updateSize: (id: number, updateData: Partial<CreateSizesType>) => {
      const url = `/protected/sizes/${id}`;
      return axiosInstanceWithAuth.put(url, updateData);
    },
    deleteSize: (id: number) => {
      const url = `/protected/sizes/${id}`;
      return axiosInstanceWithAuth.delete(url);
    },
  },
  shippingCharge: {
    getShippingCharges: (params?: string) => {
      const url = '/protected/shipping-charge' + (params ? params : '');
      return axiosInstanceWithAuth.get<Response<ShippingChargeType[], Meta>>(
        url
      );
    },
    createShippingCharge: (data: Partial<CreateShippingChargeType>) => {
      const url = '/protected/shipping-charge';
      return axiosInstanceWithAuth.post(url, data);
    },
    deleteShippingCharge: (id: number) => {
      const url = `/protected/shipping-charge/${id}`;
      return axiosInstanceWithAuth.delete(url);
    },
    updateShippingCharge: (
      id: number,
      updateData: Partial<CreateShippingChargeType>
    ) => {
      const url = `/protected/shipping-charge/${id}`;
      return axiosInstanceWithAuth.put(url, updateData);
    },
  },
  promoCode: {
    createPromoCode: (data: CreatePromoCodeType) => {
      const url = '/protected/promo-code';
      return axiosInstanceWithAuth.post(url, data);
    },
    getPromoCodes: (params?: string) => {
      const url = '/protected/promo-code' + (params ? params : '');
      return axiosInstanceWithAuth.get<Response<PromoCodeType[], Meta>>(url);
    },
    deletePromoCode: (id: number) => {
      const url = `/protected/promo-code/${id}`;
      return axiosInstanceWithAuth.delete(url);
    },
    updatePromoCode: (id: number, updateData: Partial<CreatePromoCodeType>) => {
      const url = `/protected/promo-code/${id}`;
      return axiosInstanceWithAuth.put(url, updateData);
    },
  },
};
