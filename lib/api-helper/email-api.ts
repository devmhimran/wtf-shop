import { ContactFormType } from '@/types';
import { axiosInstanceWithAuth } from '../axios';

export const emailApi = {
  contactForm: (data: ContactFormType) => {
    const url = '/send-email/contact';
    return axiosInstanceWithAuth.post(url, data);
  },
};
