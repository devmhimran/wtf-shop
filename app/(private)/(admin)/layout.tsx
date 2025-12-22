import { AppSidebar } from '@/components/shared';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import NextTopLoader from 'nextjs-toploader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mr-2 h-4' />
          <h1 className='text-lg font-semibold'>Whatthefunk</h1>
          <div className='ml-auto'>
            <div className='flex items-center gap-2'></div>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 md:p-6 p-4 bg-sidebar'>
          {children}
        </div>
      </SidebarInset>
      <NextTopLoader
        color='#0B0B0B'
        showSpinner={false}
        showAtBottom={false}
        shadow='0 0 0 0'
      />
    </SidebarProvider>
  );
}
