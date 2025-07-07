import { fetcher, fetcherDelete, fetcherPost, fetcherPut } from 'utils/axios';

export const fetchQuotations = async (id: number, payload: any) => {
  return await fetcherPost(`/api/tenant/batch/${id}/quotes`, payload);
};

export const addQuotation = async (payload: any) => {
  return await fetcherPost(`/api/tenant/batch/quotes`, payload);
};
export const editQuotation = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/batch/${id}/quotes`, payload);
};

export const deleteQuotation = async (id: any) => {
  return await fetcherDelete(`/api/tenant/batch/${id}`);
};

export const fetchQuotationDetail = async (id: number) => {
  return fetcher(`/api/tenant/batch/quotes/${id}`);
};
