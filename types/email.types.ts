export type ContactFormType = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type OrderEmailItemType = {
  id: number;
  quantity: number;
  price: number;
  total: number;

  color: string | null;
  size: string | null;

  product: {
    id: number;
    title: string;
  } | null;
};

export type OrderEmailType = {
  id: number;
  orderId: string;

  email: string;
  phone?: string | null;

  deliveryMethod: 'PICKUP' | 'SHIPPING';

  address?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;

  status: string;
  paymentStatus: string;

  subtotal: number;
  shippingCost: number;
  total: number;

  items: OrderEmailItemType[];
};
