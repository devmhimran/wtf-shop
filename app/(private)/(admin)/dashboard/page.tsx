'use client';

import { useUser } from '@/hooks';
import { signOut, useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { fetchMe, fetchMeMutation } = useUser();
  const { isLoading } = fetchMeMutation;

  return (
    <div>
      {' '}
      <h1>Home Page</h1>
      {!isLoading ? (
        <div>
          <h2>User Data:</h2>
          <pre>{JSON.stringify(fetchMe, null, 2)}</pre>
        </div>
      ) : (
        <div>Loading user data...</div>
      )}
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <div onClick={() => signOut()}>Sign Out</div>
    </div>
  );
}
