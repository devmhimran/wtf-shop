'use client';

import { MediaType } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  MoreVertical,
  Trash2,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Modal } from '@/components/shared';
import { useState } from 'react';
import { MediaDetails } from './media-details';

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return ImageIcon;
  }
  if (fileType === 'application/pdf') {
    return FileText;
  }
  if (
    fileType === 'application/vnd.ms-excel' ||
    fileType ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    fileType === 'text/csv'
  ) {
    return FileSpreadsheet;
  }
  return File;
};

const getFileTypeLabel = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return fileType.split('/')[1].toUpperCase();
  }
  if (fileType === 'application/pdf') {
    return 'PDF';
  }
  if (fileType === 'text/csv') {
    return 'CSV';
  }
  if (
    fileType === 'application/vnd.ms-excel' ||
    fileType ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'XLSX';
  }
  return 'FILE';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export function MediaCard({ data }: { data: MediaType }) {
  const [viewMediaOpen, setViewMediaOpen] = useState(false);
  const [mediaDetails, setMediaDetails] = useState<MediaType | null>(null);

  const isImage = data.fileType.startsWith('image/');
  const fileTypeLabel = getFileTypeLabel(data.fileType);

  const handleMediaView = (media: MediaType) => {
    setMediaDetails(media);
    setViewMediaOpen(true);
  };

  const renderFileIcon = () => {
    const Icon = getFileIcon(data.fileType);
    return <Icon className='w-20 h-20 text-muted-foreground' />;
  };

  return (
    <div className='overflow-hidden hover:shadow-md transition-shadow group p-0 rounded-md border'>
      <div className='relative aspect-square bg-muted flex items-center justify-center'>
        {isImage ? (
          <Image
            src={data.fileUrl}
            alt={data.alt || data.fileName}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          renderFileIcon()
        )}
        <div className='absolute top-2 right-2 md:opacity-0 group-hover:opacity-100 transition-opacity'>
          <DropdownMenu>
            <DropdownMenuTrigger className='bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-background cursor-pointer'>
              <MoreVertical className='w-4 h-4' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='gap-1'
                onClick={() => handleMediaView(data)}
              >
                <Eye className='mr-1 h-4 w-4' />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className='text-red-600 gap-1'>
                <Trash2 className='mr-1 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Badge className='absolute top-2 left-2 text-xs' variant='secondary'>
          {fileTypeLabel}
        </Badge>
      </div>
      <div className='p-3'>
        <h3 className='font-medium text-sm truncate' title={data.fileName}>
          {data.title || data.fileName}
        </h3>
        <p className='text-xs text-muted-foreground mt-1'>
          {formatFileSize(data.fileSize)}
        </p>
      </div>
      <Modal
        isOpen={viewMediaOpen}
        setIsOpen={setViewMediaOpen}
        title='Media Details'
        description=' '
      >
        <MediaDetails data={mediaDetails} />
      </Modal>
    </div>
  );
}
