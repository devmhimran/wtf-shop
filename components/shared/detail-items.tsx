import { toast } from 'sonner';

import { Button } from '../ui/button';
import { Copy } from 'lucide-react';

export function DetailItems({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  };

  return (
    <div className='space-y-1 border p-3 rounded-lg font-inter'>
      <div className='flex items-center justify-between'>
        <label className='text-sm text-muted-foreground'>{label}</label>
        {copyable && (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={handleCopy}
          >
            <Copy className='h-3 w-3' />
          </Button>
        )}
      </div>
      <div className='text-sm break-all'>{value}</div>
    </div>
  );
}
