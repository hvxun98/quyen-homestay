import { fetcherDelete, fetcherPost, fetcherPut } from 'utils/axios';

export const fetchNormTables = async (payload: any) => {
  return await fetcherPost('/api/tenant/system/extraction-template/analysis-category-filter', payload);
};

export const deleteNormTable = async (locationId: any) => {
  return await fetcherDelete(`/api/tenant/system/extraction-template/${locationId}/delete`);
};

export const createNormTable = async (payload: any) => {
  return await fetcherPost('/api/tenant/system/extraction-template/create', payload);
};

export const updateNormTable = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/client/${id}/edit`, payload);
};
