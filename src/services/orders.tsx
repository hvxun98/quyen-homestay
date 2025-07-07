import { fetcher, fetcherDelete, fetcherPost, fetcherPut } from 'utils/axios';

export const fetchOrders = async (payload: any) => {
  return await fetcherPost('/api/tenant/batch/filter', payload);
};

export const addOrders = async (payload: any) => {
  return await fetcherPost('/api/tenant/batch/create', payload);
};

export const editOrders = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/client/${id}/edit`, payload);
};

export const deleteOrders = async (id: any) => {
  return await fetcherDelete(`/api/tenant/client/${id}`);
};

//danh sách báo giá

export const fetchQuotes = async (payload: any) => {
  return await fetcherPost('/api/tenant/batch/6/quotes', payload);
};

//danh sach nhân viên công ty

export const fetchCompanyEmployeeList = async (payload: any) => {
  return await fetcherPost('/api/tenant/users/filter', payload);
};

//Phân công/kết quả phân tích

export const getAssignmentAnalysis = async (id: number, params: any) => {
  return await fetcher(`api/tenant/batch/${id}/batch-result?${params}`);
};

export const updateAssignmentAnalysis = async (id: any, payload: any) => {
  return await fetcherPost('/api/tenant/users/filter', payload);
};

//Nhập/duyệt kết quả thử nghiệm
export const getResultEntryReview = async (id: number) => {
  return await fetcher(`/api/tenant/batch/${id}/batch-approve`);
};