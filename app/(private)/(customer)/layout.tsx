import { PublicFooter, PublicNavbar } from '@/components/shared';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='font-oswald'>
      <PublicNavbar />
      <div className='min-h-screen mt-20'>{children}</div>
      <PublicFooter />
    </main>
  );
}
