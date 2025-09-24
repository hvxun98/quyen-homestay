import { fetcherPost, fetcher, fetcherPut, fetcherDelete } from 'utils/axios';

export const createHouse = async (payload: any) => {
  return await fetcherPost('/api/houses', payload);
};

export const getHouses = async (payload: any) => {
  return await fetcher(`/api/houses?page=${payload.pageNum}&size=${payload.pageSize}`);
};

export const getHouseById = async (id: string) => {
  return await fetcher(`/api/houses/${id}`);
};

export const updateHouse = async (id: string, payload: any) => {
  return await fetcherPut(`/api/houses/${id}`, payload);
};

export const deleteHouse = async (id: string) => {
  return await fetcherDelete(`/api/houses/${id}`);
};
