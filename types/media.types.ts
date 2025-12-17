export type MediaType = {
  id: number;
  title: string | null;
  alt: string | null;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMediaType = {
  file: File;
  title?: string;
  alt?: string;
};
