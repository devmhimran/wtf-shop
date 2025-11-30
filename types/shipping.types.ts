export type ShippingChargeType = {
  id: number;
  region: 'INSIDE_AU' | 'OUTSIDE_AU';
  minQty: number;
  maxQty?: number | null;
  baseCharge: number;
  additionalChargePerItem: number;
  freeShipping: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateShippingChargeType = {
  region: 'INSIDE_AU' | 'OUTSIDE_AU';
  minQty: number;
  maxQty?: number | null;
  baseCharge: number;
  additionalChargePerItem: number;
  freeShipping: boolean;
};
