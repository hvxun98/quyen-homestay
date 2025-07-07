import { fetcher, fetcherPost } from 'utils/axios';

export const registerAccount = async (data: any) => {
  return fetcherPost(`/api/tenancy/register`, data);
};

export const verifyAccount = async (verifyToken: string) => {
  return fetcher(`/api/tenancy/verify?key=${verifyToken}`);
};

export const getCity = async () => {
  return await fetcher('/api/address/province');
};
