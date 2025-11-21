import { Toaster } from 'sonner';
import { QueryClientProvider } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/react-query';

const queryClient = getQueryClient();

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
