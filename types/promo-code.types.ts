export type PromoCodeType = {
  id: number;
  title: string;
  code: string;
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePromoCodeType = {
  title: string;
  amount: number;
  startDate: string;
  endDate: string;
};
