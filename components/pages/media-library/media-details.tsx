'use client';

import { MediaType } from '@/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileTypeLabel = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return fileType.split('/')[1].toUpperCase();
  }
  if (fileType === 'application/pdf') return 'PDF';
  if (fileType === 'text/csv') return 'CSV';
  if (
    fileType === 'application/vnd.ms-excel' ||
    fileType ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 'XLSX';
  }
  return 'FILE';
};

export function MediaDetails({ data }: { data: MediaType | null }) {
  if (!data) {
    return (
      <div className='text-center py-10 text-muted-foreground'>
        No media data available
      </div>
    );
  }

  const isImage = data.fileType.startsWith('image/');

  const handleCopyUrl = () => {
    const fullUrl = `${window.location.origin}${data.fileUrl}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('URL copied to clipboard!');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = data.fileUrl;
    link.download = data.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  const handleOpenInNewTab = () => {
    window.open(data.fileUrl, '_blank');
  };

  return (
    <div className='space-y-6'>
      {/* Preview Section */}
      <div className='relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center'>
        {isImage ? (
          <Image
            src={data.fileUrl}
            alt={data.alt || data.fileName}
            fill
            className='object-contain'
            sizes='(max-width: 768px) 100vw, 600px'
          />
        ) : (
          <div className='flex flex-col items-center gap-4 p-8'>
            <div className='text-6xl text-muted-foreground'>📄</div>
            <Badge variant='secondary' className='text-lg px-4 py-1'>
              {getFileTypeLabel(data.fileType)}
            </Badge>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className='flex gap-2 flex-wrap'>
        <Button onClick={handleCopyUrl} variant='outline' size='sm'>
          <Copy className='w-4 h-4 mr-2' />
          Copy URL
        </Button>
        <Button onClick={handleDownload} variant='outline' size='sm'>
          <Download className='w-4 h-4 mr-2' />
          Download
        </Button>
        <Button onClick={handleOpenInNewTab} variant='outline' size='sm'>
          <ExternalLink className='w-4 h-4 mr-2' />
          Open in New Tab
        </Button>
      </div>

      {/* Details Section */}
      <div className='space-y-4 border-t pt-4'>
        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            File Name
          </label>
          <p className='text-sm mt-1 font-mono break-all'>{data.fileName}</p>
        </div>

        {data.title && (
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Title
            </label>
            <p className='text-sm mt-1'>{data.title}</p>
          </div>
        )}

        {data.alt && (
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              Alt Text
            </label>
            <p className='text-sm mt-1'>{data.alt}</p>
          </div>
        )}

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              File Type
            </label>
            <p className='text-sm mt-1'>{data.fileType}</p>
          </div>
          <div>
            <label className='text-sm font-medium text-muted-foreground'>
              File Size
            </label>
            <p className='text-sm mt-1'>{formatFileSize(data.fileSize)}</p>
          </div>
        </div>

        <div>
          <label className='text-sm font-medium text-muted-foreground'>
            Created At
          </label>
          <p className='text-sm mt-1'>
            {dayjs(data.createdAt).format('MMM D, YYYY h:mm A')}
          </p>
        </div>
      </div>
    </div>
  );
}
