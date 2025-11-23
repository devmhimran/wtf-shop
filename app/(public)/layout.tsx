export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className='font-oswald'>{children}</main>;
}
