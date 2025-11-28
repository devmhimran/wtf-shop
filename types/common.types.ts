export type Response<X, Y> = {
  success?: boolean;
  message: string;
  data: X;
  meta: Y;
};

export type Meta = {
  count: number;
  limit: number;
  page: number;
  totalPages: number;
};

export type CommonApiResponseError = {
  response?: {
    data: { error: ErrorItem[] };
  };
  message?: string;
};

export type ErrorItem = {
  path?: string;
  message: string;
};
