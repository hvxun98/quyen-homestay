import { fetcher, fetcherDelete, fetcherPost, fetcherPut } from 'utils/axios';

//Loại mẫu
export const getSampleTypes = async () => {
  return fetcher(`/api/tenant/system/sample-type/find-all`);
};

//template cho bóc tách

export const fetchAnalysisRequest = async (payload: any) => {
  return fetcherPost(`/api/tenant/analysis-request/filter`, payload);
};

export const fetchScanRequests = async (payload: any) => {
  return fetcherPost(`/api/tenant/scan-request/filter`, payload);
};
