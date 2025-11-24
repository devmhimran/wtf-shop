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
