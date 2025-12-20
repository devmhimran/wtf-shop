export type CustomersType = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER';
  isDelete: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateCustomerType = {
  id: number;
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
};
