import { Button } from '@/components/ui/button';
import { handleCopyUrl, handleDownload, handleOpenInNewTab } from '@/lib/utils';
import { CustomImageType } from '@/types';
import { Copy, Download, ExternalLink } from 'lucide-react';
import Image from 'next/image';

type OrderCustomizeViewProps = {
  data: CustomImageType | null;
};

export function OrderCustomizeView({ data }: OrderCustomizeViewProps) {
  if (!data) return null;

  return (
    <div className='space-y-6'>
      <div className='relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center'>
        <Image
          src={data.imageUrl}
          alt={data.imageName}
          fill
          className='object-contain'
          sizes='(max-width: 768px) 100vw, 600px'
        />
      </div>
      <div className='flex gap-2 flex-wrap'>
        <Button
          onClick={() => handleCopyUrl(data.imageUrl)}
          variant='outline'
          size='sm'
        >
          <Copy className='w-4 h-4 mr-2' />
          Copy URL
        </Button>
        <Button
          onClick={() => handleDownload(data.imageUrl, data.imageName)}
          variant='outline'
          size='sm'
        >
          <Download className='w-4 h-4 mr-2' />
          Download
        </Button>
        <Button
          onClick={() => handleOpenInNewTab(data.imageUrl)}
          variant='outline'
          size='sm'
        >
          <ExternalLink className='w-4 h-4 mr-2' />
          Open in New Tab
        </Button>
      </div>

      <div className='space-y-1 border p-3 rounded-lg font-inter'>
        <div className='flex items-center justify-between'>
          <label className='text-sm text-muted-foreground'>
            Customize Note
          </label>
        </div>
        <div>{data.note}</div>
      </div>
    </div>
  );
}
