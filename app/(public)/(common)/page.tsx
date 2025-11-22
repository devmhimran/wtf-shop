'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import { authApi } from '@/lib/api-helper';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'authenticated' && session?.accessToken) {
        setLoading(true);
        setError(null);

        try {
          const response = await authApi.me();

          if (response.status === 200) {
            setUserData(response.data);
          } else {
            setError('Failed to fetch user data');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          const errorMessage =
            err instanceof Error
              ? err.message
              : (err as { response?: { data?: { error?: string } } })?.response
                  ?.data?.error || 'An error occurred while fetching user data';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session, status]);

  if (status === 'loading') {
    return <div>Loading session...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Please log in to view this page</div>;
  }

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Home Page</h1>
      {userData ? (
        <div>
          <h2>User Data:</h2>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        </div>
      ) : (
        <div>No user data available</div>
      )}
    </div>
  );
}
