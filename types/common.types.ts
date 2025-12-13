export type Response<X, Y> = {
  success?: boolean;
  message: string;
  data: X;
  meta: Y;
};

export type DetailsResponse<X> = {
  success?: boolean;
  message: string;
  data: X;
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

export type CartCustomization = {
  id: string;
  imagePreview: string;
  imageName: string;
  imageSize: number;
  imageType: string;
  note: string;
};
