export type UsersType = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  isDelete: boolean;
  isActive: boolean;
  createdAt: Date;
};

export type CreateAdminUserType = {
  name: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  isActive: boolean;
};
