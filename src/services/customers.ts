import { fetcher, fetcherDelete, fetcherPost, fetcherPut } from 'utils/axios';

export const fetchCustomer = async (payload: any) => {
  return await fetcherPost('/api/tenant/client/filter', payload);
};

export const addCustomer = async (payload: any) => {
  return await fetcherPost('/api/tenant/client/create', payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export const editCustomer = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/client/${id}/edit`, payload);
};

export const deleteCustomer = async (id: any) => {
  return await fetcherDelete(`/api/tenant/client/${id}`);
};

//Liên hệ
export const fetchContacts = async (id: number, payload: any) => {
  return await fetcherPost(`/api/tenant/client/${id}/client-contact/filter`, payload);
};

export const addContacts = async (id: number, payload: any) => {
  return await fetcherPost(`/api/tenant/client/${id}/client-contact/create`, payload);
};

export const editContacts = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/client/${id}/edit`, payload);
};

export const deleteContacts = async (id: any) => {
  return await fetcherDelete(`/api/tenant/client/${id}`);
};

//Địa điểm
export const fetchLocation = async (id: number, payload: any) => {
  return await fetcherPost(`/api/tenant/client/${id}/client-location/filter`, payload);
};

export const addLocation = async (id: number, payload: any) => {
  return await fetcherPost(`/api/tenant/client/${id}/client-location/create`, payload);
};

export const editLocation = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/client/${id}/edit`, payload);
};

export const deleteLocation = async (id: any) => {
  return await fetcherDelete(`/api/tenant/client/${id}`);
};

// Hợp đồng
export const fetchContracts = async (id: number, payload: any) => {
  return await fetcherPost(`/api/tenant/client/${id}/client-contract/filter`, payload);
};

export const addContract = async (id: number, payload: any) => {
  return await fetcherPost(`/api/tenant/client/${id}/client-contract/create`, payload);
};

export const editContract = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/client/${id}/edit`, payload);
};

export const deleteContract = async (id: any) => {
  return await fetcherDelete(`/api/tenant/client/${id}`);
};

//vị trí lấy mẫu quan trắc
export const fetchMonitoringLocations = async (locationId: number, payload: any) => {
  return await fetcherPost(`/api/tenant/client/client-location/${locationId}/client-location-sample/filter`, payload);
};

export const addMonitoringLocation = async (locationId: number, payload: any) => {
  return await fetcherPost(`/api/tenant/client/client-location/${locationId}/client-location-sample/create`, payload);
};

export const editMonitoringLocation = async (id: number, payload: any) => {
  return await fetcherPut(`/api/tenant/client/${id}/edit`, payload);
};

export const deleteMonitoringLocation = async (id: any) => {
  return await fetcherDelete(`/api/tenant/client/${id}`);
};

//lịch lấy mẫu quan trắc
export const fetchMonitoringSchedules = async (locationId: number, payload: any) => {
  return await fetcherPost(`api/tenant/client/client-location/${locationId}/client-location-scheduler/filter`, payload);
};

export const addMonitoringSchedule = async (locationId: number, payload: any) => {
  return await fetcherPost(`/api/tenant/client/client-location/${locationId}/client-location-scheduler/create`, payload);
};

export const editMonitoringSchedule = async (locationId: number, payload: any) => {
  return await fetcherPut(`/api/tenant/client/client-location/${locationId}/client-location-scheduler/update`, payload);
};

export const deleteMonitoringSchedule = async (locationId: any) => {
  return await fetcherDelete(`/api/tenant/client/client-location/${locationId}/client-location-scheduler/delete`);
};

//phòng ban/ chi nhánh
export const getDepartment = async () => {
  return await fetcher('/api/admin/brands');
};
