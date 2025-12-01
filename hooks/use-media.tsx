import { mediaApi } from '@/lib/api-helper';
import { getQueryClient } from '@/lib/react-query';
import { MediaType, Meta, Response } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export const useMedia = () => {
  const deleteMediaMutation = useMutation({
    mutationFn: async (id: number) =>
      await mediaApi.deleteMedia(id).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] });
    },
  });

  return {
    deleteMediaMutation,
    deleteMedia: deleteMediaMutation.mutate,
    deleteMediaAsync: deleteMediaMutation.mutateAsync,
  };
};

export const useGetAllMedia = (options?: string) => {
  const fetchAllMediaMutation = useQuery<Response<MediaType[], Meta>>({
    queryKey: ['media', options],
    queryFn: async () => {
      const res = await mediaApi
        .getAllMedia(options)
        .then((response) => response.data);
      return res;
    },
  });
  return {
    fetchAllMediaMutation,
    fetchAllMediaMutationData: fetchAllMediaMutation.data,
  };
};
