import { PublicFooter, PublicNavbar } from '@/components/shared';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='font-oswald'>
      <PublicNavbar />
      <div className='min-h-screen mt-6 md:mt-20 bg-gray-50/50'>{children}</div>
      <PublicFooter />
    </main>
  );
}
