'use client';

import { useParams } from 'next/navigation';

export default function NewDropsPageDetails() {
  const { slug } = useParams();
  console.log({ slug });
  return <div>page</div>;
}
