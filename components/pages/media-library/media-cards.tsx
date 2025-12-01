import { MediaType } from '@/types';
import { MediaCard } from './media-card';

export function MediaCards({ data }: { data: MediaType[] }) {
  return (
    <div className='grid grid-cols-2 md:grid-cols-5 lg:grid-cols-8 gap-5'>
      {data.map((media) => (
        <MediaCard key={media.id} data={media} />
      ))}
    </div>
  );
}
