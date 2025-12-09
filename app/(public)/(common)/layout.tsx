export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='mt-20'>{children}</div>;
}
