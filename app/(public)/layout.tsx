import { PublicFooter, PublicNavbar } from '@/components/shared';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='font-oswald'>
      <PublicNavbar />
      <div className=' min-h-screen pb-10'>{children}</div>
      <PublicFooter />
    </main>
  );
}
