import {
  CategoryType,
  ColorType,
  CreateCategoryType,
  CreateColorsType,
  CreateProductType,
  CreatePromoCodeType,
  CreateShippingChargeType,
  CreateSizesType,
  CreateSubCategoryType,
  CustomerOrderCalculationType,
  DetailsResponse,
  Meta,
  OrderCustomerType,
  OrderDetailType,
  OrdersType,
  ProductType,
  PromoCodeType,
  PublicCategoryType,
  PublicProductDetailsType,
  PublicProductType,
  Response,
  ShippingChargeType,
  SizeType,
  SubCategoryType,
} from '@/types';
import { axiosInstance, axiosInstanceWithAuth } from '../axios';

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
  products: {
    getAllProducts: (params?: string) => {
      const url = '/protected/products' + (params ? params : '');
      return axiosInstanceWithAuth.get<Response<ProductType[], Meta>>(url);
    },
    createProduct: (data: CreateProductType) => {
      const url = '/protected/products';
      return axiosInstanceWithAuth.post(url, data);
    },
    deleteProduct: (id: number) => {
      const url = `/protected/products/${id}`;
      return axiosInstanceWithAuth.delete(url);
    },
    updateProduct: (id: number, updateData: Partial<CreateProductType>) => {
      const url = `/protected/products/${id}`;
      return axiosInstanceWithAuth.put(url, updateData);
    },
    getSingleProduct: (id: number) => {
      const url = `/protected/products/${id}`;
      return axiosInstanceWithAuth.get<DetailsResponse<ProductType>>(url);
    },
  },
  order: {
    getAllOrders: (params?: string) => {
      const url = '/protected/orders' + (params ? params : '');
      return axiosInstanceWithAuth.get<Response<OrdersType[], Meta>>(url);
    },
    getOrderDetails: (orderId: string) => {
      const url = `/protected/orders/${orderId}`;
      return axiosInstanceWithAuth.get<DetailsResponse<OrderDetailType>>(url);
    },
    updateOrderStatus: (orderId: string, newStatus: string) => {
      const url = `/protected/orders/${orderId}`;
      return axiosInstanceWithAuth.patch(url, { status: newStatus });
    },
    getCustomerOrders: (params?: string) => {
      const url = `/protected/customer-orders` + (params ? params : '');
      return axiosInstanceWithAuth.get<Response<OrderCustomerType[], Meta>>(
        url
      );
    },
    getCustomerOrderCalculations: () => {
      const url = `/protected/customer-order-calculation`;
      return axiosInstanceWithAuth.get<
        DetailsResponse<CustomerOrderCalculationType>
      >(url);
    },
  },
  public: {
    categories: {
      getCategories: (params?: string) => {
        const url = '/public/categories' + (params ? params : '');
        return axiosInstance.get<Response<PublicCategoryType[], Meta>>(url);
      },
    },
    products: {
      getProducts: (params?: string) => {
        const url = `/public/products` + (params ? params : '');
        return axiosInstance.get<Response<ProductType[], Meta>>(url);
      },
      getSingleProduct: (slug: string) => {
        const url = `/public/products/${slug}`;
        return axiosInstance.get<DetailsResponse<PublicProductDetailsType>>(
          url
        );
      },
      getAllRelatedProducts: (params?: string) => {
        const url = `/public/related-products` + (params ? params : '');
        return axiosInstance.get<Response<PublicProductType[], Meta>>(url);
      },
      getPromoCode: (code: string) => {
        const url = `/public/promo-code`;
        return axiosInstance.post<DetailsResponse<Omit<PromoCodeType, 'id'>>>(
          url,
          {
            promoCode: code,
          }
        );
      },
      getShippingCharge: (quantity: number, region: string) => {
        const url = `/public/shipping`;
        return axiosInstance.post(url, { quantity, region });
      },
    },
    publicOrder: {
      createPublicOrder: (data: FormData) => {
        const url = '/payment/create-order';
        return axiosInstance.post(url, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
    },
  },
};
