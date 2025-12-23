export type SingularPagesTypes = {
  id: number;
  isSingleton: boolean;
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSingularPageType = {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
};
