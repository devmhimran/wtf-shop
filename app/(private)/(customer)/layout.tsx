import { PublicFooter, PublicNavbar } from '@/components/shared';
import NextTopLoader from 'nextjs-toploader';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='font-oswald'>
      {/* <PublicNavbar /> */}
      <div className='min-h-screen mt-6 md:mt-20 bg-gray-50/50'>{children}</div>
      <PublicFooter />
      <NextTopLoader
        color='#FF8804'
        showSpinner={false}
        showAtBottom={false}
        shadow='0 0 0 0'
      />
    </main>
  );
}
