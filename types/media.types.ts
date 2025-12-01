export type MediaType = {
  id: number;
  title: string | null;
  alt: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateMediaType = {
  file: File;
};
