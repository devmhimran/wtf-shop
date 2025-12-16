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
  subTotal: number;
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
