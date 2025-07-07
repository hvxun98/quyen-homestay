import { fetcher, fetcherDelete, fetcherPost, fetcherPut } from 'utils/axios';

//Loại mẫu
export const getSampleTypes = async () => {
  return fetcher(`/api/tenant/system/sample-type/find-all`);
};

//template cho bóc tách

export const getSampleTemplates = async (payload: any) => {
  return fetcherPost(`/api/tenant/system/extraction-template/filter`, payload);
};

export const deleteSampleTemplate = async (locationId: any) => {
  return await fetcherDelete(`/api/tenant/system/extraction-template/${locationId}/delete`);
};

export const createSampleTemplate = async (payload: any) => {
  return await fetcherPost('/api/tenant/system/extraction-template/create', payload);
};

export const updateSampleTemplate = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/client/${id}/edit`, payload);
};

export const fetchIndicatorGroups = async () => {
  return fetcher(`/api/tenant/system/sample-type/find-all`);
};

export const fetchIndicatorsByGroup = async (id: string) => {
  return fetcher(`/api/tenant/system/sample-type/find-all/${id}`);
};

// lấy danh sách nhóm chỉ tiêu
export const fetchAnalysisCategory = async (payload: any) => {
  return await fetcherPost('/api/tenant/system/extraction-template/analysis-category-filter', payload);
};
// lấy danh sách chỉ tiêu
export const fetchAnalysisService = async (payload: any) => {
  return await fetcherPost('/api/tenant/system/extraction-template/analysis-service-filter', payload);
};

//Thầu phụ
export const createSubcontractor = async (payload: any) => {
  return await fetcherPost('/api/tenant/system/sub-contractor/create', payload);
};

export const updateSubcontractor = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/client/${id}/edit`, payload);
};

export const fetchSubcontractors = async (payload: any) => {
  return await fetcherPost('/api/tenant/system/sub-contractor/filter', payload);
};
export const deleteSubcontractor = async (locationId: any) => {
  return await fetcherDelete(`/api/tenant/system/sub-contractor/${locationId}/delete`);
};

// phương pháp phân tích
export const createAnalysisMethod = async (payload: any) => {
  return await fetcherPost('/api/tenant/system/analysis-method/create', payload);
};

export const updateAnalysisMethod = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/system/analysis-method/${id}/edit`, payload);
};

export const fetchAnalysisMethods = async (payload: any) => {
  return await fetcherPost('/api/tenant/system/analysis-method/filter', payload);
};
export const deleteAnalysisMethod = async (locationId: any) => {
  return await fetcherDelete(`/api/tenant/system/analysis-method/${locationId}/delete`);
};
