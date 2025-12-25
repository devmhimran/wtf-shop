import {
  MobileBottomNav,
  PublicFooter,
  PublicNavbar,
} from '@/components/shared';
import NextTopLoader from 'nextjs-toploader';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='font-oswald'>
      {/* <PublicNavbar /> */}
      <div className='min-h-screen pb-10'>{children}</div>
      <PublicFooter />
      <MobileBottomNav />
      <NextTopLoader
        color='#FF8804'
        showSpinner={false}
        showAtBottom={false}
        shadow='0 0 0 0'
      />
    </main>
  );
}
