export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

export type UserType = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    role: UserRole;
  };
};
export type SignInRequest = {
  email: string;
  password: string;
};

export type MeResponse = {
  message: string;
  user: UserType;
};

export type UserMeResponse = {
  message: string;
  user: UserType;
};
