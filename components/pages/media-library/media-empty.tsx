import { ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaEmptyProps {
  onUploadClick?: () => void;
}

export function MediaEmpty({ onUploadClick }: MediaEmptyProps) {
  return (
    <div className='flex flex-col items-center justify-center py-20 px-4'>
      <div className='rounded-full bg-muted p-6 mb-6'>
        <ImageOff className='w-10 md:w-16 h-10 md:h-16 text-muted-foreground' />
      </div>

      <h3 className='text-2xl font-semibold mb-2'>No media files yet</h3>

      <p className='text-muted-foreground text-center max-w-md mb-6'>
        Upload your first image, PDF, or document to get started. Your media
        library will appear here.
      </p>

      {onUploadClick && (
        <Button onClick={onUploadClick} size='lg'>
          Upload Media
        </Button>
      )}
    </div>
  );
}
