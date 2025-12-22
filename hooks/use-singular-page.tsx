import { singularPagesApi } from '@/lib/api-helper/singular-pages-api';
import { getQueryClient } from '@/lib/react-query';
import {
  CreateSingularPageType,
  DetailsResponse,
  SingularPagesTypes,
} from '@/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const queryClient = getQueryClient();

export function useAboutPage() {
  const fetchAboutUs = useQuery<DetailsResponse<SingularPagesTypes>>({
    queryKey: ['about-us-page'],
    queryFn: async () => {
      const res = await singularPagesApi
        .getAboutUsPage()
        .then((res) => res.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const updateAboutUsPage = useMutation({
    mutationFn: async (data: CreateSingularPageType) =>
      await singularPagesApi.updateAboutUsPage(data).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['about-us-page'] });
    },
  });

  return {
    fetchAboutUs,
    fetchAboutUsData: fetchAboutUs.data?.data,

    updateAboutUsPage,
    updateAboutUsPageMutate: updateAboutUsPage.mutate,
    updateAboutUsPageMutateAsync: updateAboutUsPage.mutateAsync,
  };
}
export function useTermsAndConditionPage() {
  const fetchTermsAndConditions = useQuery<DetailsResponse<SingularPagesTypes>>(
    {
      queryKey: ['terms-and-conditions-page'],
      queryFn: async () => {
        const res = await singularPagesApi
          .getTermsAndConditionsPage()
          .then((res) => res.data);
        return res;
      },
      placeholderData: keepPreviousData,
    }
  );

  const updateTermsAndConditionsPage = useMutation({
    mutationFn: async (data: CreateSingularPageType) =>
      await singularPagesApi
        .updateTermsAndConditionsPage(data)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['terms-and-conditions-page'],
      });
    },
  });

  return {
    fetchTermsAndConditions,
    fetchTermsAndConditionsData: fetchTermsAndConditions.data?.data,

    updateTermsAndConditionsPage,
    updateTermsAndConditionsPageMutate: updateTermsAndConditionsPage.mutate,
    updateTermsAndConditionsPageMutateAsync:
      updateTermsAndConditionsPage.mutateAsync,
  };
}
export function usePrivacyPolicyPage() {
  const fetchPrivacyPolicy = useQuery<DetailsResponse<SingularPagesTypes>>({
    queryKey: ['privacy-policy-page'],
    queryFn: async () => {
      const res = await singularPagesApi
        .getPrivacyPolicyPage()
        .then((res) => res.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const updatePrivacyPolicyPage = useMutation({
    mutationFn: async (data: CreateSingularPageType) =>
      await singularPagesApi
        .updatePrivacyPolicyPage(data)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['privacy-policy-page'],
      });
    },
  });

  return {
    fetchPrivacyPolicy,
    fetchPrivacyPolicyData: fetchPrivacyPolicy.data?.data,

    updatePrivacyPolicyPage,
    updatePrivacyPolicyPageMutate: updatePrivacyPolicyPage.mutate,
    updatePrivacyPolicyPageMutateAsync: updatePrivacyPolicyPage.mutateAsync,
  };
}

export function useReturnAndExchangePage() {
  const fetchReturnAndExchange = useQuery<DetailsResponse<SingularPagesTypes>>({
    queryKey: ['return-and-exchange-page'],
    queryFn: async () => {
      const res = await singularPagesApi
        .getReturnAndExchangePage()
        .then((res) => res.data);
      return res;
    },
    placeholderData: keepPreviousData,
  });

  const updateReturnAndExchangePage = useMutation({
    mutationFn: async (data: CreateSingularPageType) =>
      await singularPagesApi
        .updateReturnAndExchangePage(data)
        .then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['return-and-exchange-page'],
      });
    },
  });

  return {
    fetchReturnAndExchange,
    fetchReturnAndExchangeData: fetchReturnAndExchange.data?.data,

    updateReturnAndExchangePage,
    updateReturnAndExchangePageMutate: updateReturnAndExchangePage.mutate,
    updateReturnAndExchangePageMutateAsync:
      updateReturnAndExchangePage.mutateAsync,
  };
}
