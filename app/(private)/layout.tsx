export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className='font-inter'>{children}</main>;
}
