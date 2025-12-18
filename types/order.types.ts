import { $Enums } from '@/generated/prisma/client';
import { MediaType } from './media.types';

export type CartCustomizationType = {
  imagePreview: string;
  imageName: string;
  imageType?: string;
  note: string;
};

export type CartItemType = {
  productId: number;
  variantId: number;
  color: string;
  size: string;
  printSide: string;
  quantity: number;
  price: number;
  total: number;
  image: string;
  title: string;
  customizations?: CartCustomizationType[];
};

export type CheckoutDataType = {
  finalTotal: number;
  formData: {
    email: string;
    name: string;
    phone: string;
    address: string;
    city?: string;
    state: string;
    postalCode?: string;
    country: string;
    deliveryMethod: string;
  };
  items: CartItemType[];
  calculations: {
    total: number;
    subtotal: number;
    quantityDiscount: number;
    flatDiscount: number;
  };
  shippingCost: number;
  promoDiscount?: number;
  appliedPromo?: {
    code: string;
  };
};

export type CreateOrderDataType = {
  email: string;
  name: string;
  phone: string;
  address: string;
  state: string;
  country: string;

  deliveryMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;

  stripeId: string;
  paymentStatus: string;

  items: {
    productId: number;
    variantId: number;
    color: string;
    size: string;
    printSide: string;
    quantity: number;
    price: number;
    total: number;

    customNote: string | null;
    customImages: {
      note: string;
    }[];
  }[];
};

export type CustomImageType = {
  id: number;
  imageUrl: string;
  imageName: string;
  note: string;
};

export type OrderItemsType = {
  id: number;
  productId: number;
  orderId: number;
  variantId: number;
  color: string;
  size: string;
  printSide: string;
  quantity: number;
  price: number;
  total: number;
  customNote: string | null;
  customImages: CustomImageType[];
  product: {
    id: number;
    title: string;
    slug: string;
    catalogId: number;
    productType: string;
    mainImage: {
      id: number;
      fileUrl: string;
      fileName: string;
      title: string;
      alt: string;
    } | null;
  };
};

export type OrdersType = {
  id: number;
  orderId: string;
  email: string;
  status: $Enums.OrderStatus;
  paymentStatus: $Enums.PaymentStatus;
  deliveryMethod: $Enums.DeliveryMethod;
  stripeId: string;
  total: number;
  createdAt: string;
};

export type OrderDetailType = OrdersType & {
  subtotal: number;
  shippingCost: number;
  total: number;
  address: string;
  state: string;
  postalCode: string | null;
  country: string;
  phone: string;
  updatedAt: string;
  items: OrderItemsType[];
};

export type CustomerOrderItemType = {
  id: number;
  productId: number;
  color: string;
  size: string;
  printSide: string;
  quantity: number;
  price: number;
  total: number;
  customNote: string | null;
  product: {
    id: number;
    title: string;
    slug: string;
    mainImage: MediaType;
    alternativeImages: MediaType | null;
  };
  customImages: (Omit<CustomImageType, never> & {
    orderId: number;
  })[];
};

export type OrderCustomerType = {
  id: number;
  orderId: string;
  email: string;
  status: $Enums.OrderStatus;
  paymentStatus: $Enums.PaymentStatus;
  deliveryMethod: $Enums.DeliveryMethod;
  stripeId: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  address: string;
  state: string;
  postalCode: string | null;
  country: string;
  phone: string;
  createdAt: string;
  items: CustomerOrderItemType[];
};

export type CustomerOrderCalculationType = {
  summary: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    totalShippingPaid: number;
    activeOrdersCount: number;
    completedOrdersCount: number;
  };
  monthlySpending: {
    [monthYear: string]: number;
  };
};
