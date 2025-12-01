import { MediaViewerContainer } from '@/components/pages/media-library';

export default function MediaLibraryPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>Media Library</h1>
      </div>
      <MediaViewerContainer />
    </div>
  );
}
