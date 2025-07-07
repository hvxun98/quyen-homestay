import { fetcherPost } from 'utils/axios';

export const createBrand = async (payload: any) => {
  return await fetcherPost('/api/admin/brands', payload);
};
