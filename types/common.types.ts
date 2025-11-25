export type Response<X, Y> = {
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
    data: { error: string };
  };
  message?: string;
};
