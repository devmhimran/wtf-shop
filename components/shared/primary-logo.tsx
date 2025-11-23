import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type PrimaryLogoProps = {
  width?: number;
  height?: number;
  className?: string;
  link?: string;
};

export function PrimaryLogo({
  width = 120,
  height = 80,
  link,
  className,
}: PrimaryLogoProps) {
  const logo = (
    <Image
      src='/assets/png/what-the-funk.png'
      width={width}
      height={height}
      alt='Logo Main'
      className={cn('w-14 inline', className)}
    />
  );

  if (!link) {
    return logo;
  }
  return <Link href={link}>{logo}</Link>;
}
