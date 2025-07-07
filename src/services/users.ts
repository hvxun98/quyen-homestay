import { PermissionAssignProps } from 'types/role';
import { fetcher, fetcherDelete, fetcherPost, fetcherPut } from 'utils/axios';
import { fetcherPost as fetcherPostPublic } from 'utils/axios';

export const postLogin = async (payload: { username: string; password: string; rememberMe: boolean }) => {
  return await fetcherPostPublic('/api/authenticate', payload);
};

export const getUsers = async (payload: any) => {
  return await fetcherPost('/api/admin/users/filter', payload);
};

export const deleteUser = async (userId: any) => {
  return await fetcherDelete(`/api/admin/users/${userId}`);
};

export const postBlockUser = async (userId: any) => {
  return await fetcherPost(`/api/admin/users/${userId}/block`);
};

export const getBrands = async () => {
  return await fetcher('/api/admin/brands');
};

export const getRolesByBrand = async (payload: any) => {
  return await fetcher(`/api/admin/users/${payload?.userId}/roles/brands/${payload?.brandId}`);
};

export const createUser = async (payload: any) => {
  return await fetcherPost('/api/tenant/users', payload);
};

export const updateUser = async (payload: any) => {
  return await fetcherPut('/api/tenant/users', payload);
};

export const copyUser = async (payload: any) => {
  return await fetcherPost(`/api/tenant/users/${payload?.id}/copy`, payload);
};

export const getUserDetail = async (login: string) => {
  return await fetcher(`/api/admin/users/${login}`);
};

export const getRolesSystem = async () => {
  return await fetcher(`/api/admin/roles/system`);
};

export const getPrivileges = async () => {
  return await fetcher(`/api/admin/users/setting/privileges`);
};

export const postPermissionAssign = async (payload: PermissionAssignProps) => {
  return await fetcherPost(`/api/admin/permissions/assign`, payload);
};

export const postCreateRole = async (payload: { name: string }) => {
  return await fetcherPost(`/api/admin/roles`, payload);
};
