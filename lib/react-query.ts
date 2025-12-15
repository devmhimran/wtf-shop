import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const getQueryClient = (() => {
  let queryClient: QueryClient | undefined;
  return () => {
    if (!queryClient) {
      queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: Error) => {
              // Don't retry on 401 errors (unauthorized)
              if ((error as AxiosError)?.response?.status === 401) {
                return false;
              }
              // Retry other errors up to 2 times
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
        },
      });
    }
    return queryClient!;
  };
})();
