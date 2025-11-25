export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

export type ProfileType = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export type SignInResponse = {
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
  user: ProfileType;
};

export type UserMeResponse = {
  message: string;
  user: ProfileType;
};
