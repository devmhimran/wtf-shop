import axios from 'axios';

export const uploadSettings = {
  headers: {
    Accept: '*/*',
    'content-type': 'multipart/form-data',
  },
};

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + '/api',
  timeout: 60000,
});

export default instance;
