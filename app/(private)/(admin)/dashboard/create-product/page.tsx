import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function CreateProductPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl md:text-3xl font-bold'>Products</h1>

        <Button>
          <Save className='mr-2 h-4 w-4' />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
