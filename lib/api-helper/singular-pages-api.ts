import { CreateSingularPageType } from '@/types';
import { axiosInstanceWithAuth } from '../axios';

const protectedUrl = '/protected';

export const singularPagesApi = {
  getAboutUsPage: () => {
    const url = protectedUrl + '/about-us';
    return axiosInstanceWithAuth.get(url);
  },
  updateAboutUsPage: (data: CreateSingularPageType) => {
    const url = protectedUrl + '/about-us';
    return axiosInstanceWithAuth.post(url, data);
  },
  getTermsAndConditionsPage: () => {
    const url = protectedUrl + '/terms-and-conditions';
    return axiosInstanceWithAuth.get(url);
  },
  updateTermsAndConditionsPage: (data: CreateSingularPageType) => {
    const url = protectedUrl + '/terms-and-conditions';
    return axiosInstanceWithAuth.post(url, data);
  },
  getPrivacyPolicyPage: () => {
    const url = protectedUrl + '/privacy-policy';
    return axiosInstanceWithAuth.get(url);
  },
  updatePrivacyPolicyPage: (data: CreateSingularPageType) => {
    const url = protectedUrl + '/privacy-policy';
    return axiosInstanceWithAuth.post(url, data);
  },
  getReturnAndExchangePage: () => {
    const url = protectedUrl + '/returns-and-exchanges';
    return axiosInstanceWithAuth.get(url);
  },
  updateReturnAndExchangePage: (data: CreateSingularPageType) => {
    const url = protectedUrl + '/returns-and-exchanges';
    return axiosInstanceWithAuth.post(url, data);
  },
};
