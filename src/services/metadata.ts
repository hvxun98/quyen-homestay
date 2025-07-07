import { fetcher } from 'utils/axios';

export const fetchProvinces = async () => {
  return await fetcher('/api/address/province');
};
