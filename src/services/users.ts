// src/services/users.ts
import { fetcher, fetcherPost, fetcherPut, fetcherDelete } from 'utils/axios';

export type Role = 'admin' | 'staff';

export type UserRow = {
  _id: string;
  name?: string;
  email: string;
  role: Role;
  houses?: { _id: string; code?: string; address?: string }[];
  createdAt?: string;
};

export type ListUsersParams = {
  page?: number;
  limit?: number;
  q?: string;
  role?: Role | '';
};

export type CreateUserPayload = {
  name?: string;
  email: string;
  password?: string;
  role: Role;
  houseIds?: string[]; // required when role === 'staff'
};

export type UpdateUserPayload = Partial<{
  name: string;
  email: string;
  password: string;
  role: Role;
  houseIds: string[];
}>;

export type ListUsersResult = {
  items: UserRow[];
  total: number;
  page: number;
  limit: number;
};

/** Build query string from params */
function qs(obj: Record<string, any>) {
  const p = new URLSearchParams();
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v === undefined || v === null || v === '') return;
    p.append(k, String(v));
  });
  return p.toString();
}

/** List users (paginated) */
export const listUsers = async (params: ListUsersParams = {}): Promise<ListUsersResult> => {
  const q = qs({
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    q: params.q,
    role: params.role
  });
  return await fetcher(`/api/users?${q}`);
};

/** Get single user by id */
export const getUser = async (id: string): Promise<UserRow> => {
  return await fetcher(`/api/users/${id}`);
};

/** Create new user */
export const createUser = async (payload: CreateUserPayload): Promise<UserRow> => {
  return await fetcherPost('/api/users', payload);
};

/** Update user */
export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<UserRow> => {
  return await fetcherPut(`/api/users/${id}`, payload);
};

/** Delete user */
export const deleteUser = async (id: string): Promise<{ message?: string; id?: string }> => {
  return await fetcherDelete(`/api/users/${id}`);
};
