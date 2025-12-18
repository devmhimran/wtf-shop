import {
  CustomerMobileNavbar,
  CustomerSidebar,
} from '@/components/pages/customer';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 container mx-auto pt-20 px-2 md:px-0'>
      <div className='lg:block hidden lg:col-span-1'>
        <CustomerSidebar />
      </div>
      <div className='lg:hidden block col-span-1'>
        <CustomerMobileNavbar />
      </div>

      <div className='lg:col-span-4 space-y-6'>{children}</div>
    </div>
  );
}
