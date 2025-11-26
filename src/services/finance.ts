import { fetcherPost, fetcher, fetcherPut, fetcherDelete } from 'utils/axios';

export type FinanceType = 'income' | 'expense';

export const listFinanceRecords = async (params: {
  houseId: string;
  year: number;
  month: number;
  type?: FinanceType;
  pageNum?: number;
  pageSize?: number;
  q?: string;
}) => {
  const { houseId, year, month, type, pageNum = 1, pageSize = 20, q } = params;
  const qs = new URLSearchParams({
    houseId,
    year: String(year),
    month: String(month),
    page: String(pageNum),
    limit: String(pageSize),
    ...(type ? { type } : {}),
    ...(q ? { q } : {})
  }).toString();
  return await fetcher(`/api/finance/records?${qs}`);
};

export const createIncome = async (payload: {
  houseId: string;
  year: number;
  month: number;
  amount: number;
  note?: string;
  categoryId?: string | null;
}) => {
  return await fetcherPost('/api/finance/records', {
    ...payload,
    type: 'income'
  });
};

export const createExpense = async (payload: {
  houseId: string;
  year: number;
  month: number;
  amount: number;
  note?: string;
  categoryId: string;
  attachmentIds?: string[];
}) => {
  return await fetcherPost('/api/finance/records', {
    ...payload,
    type: 'expense'
  });
};

export const updateFinanceRecord = async (id: string, payload: any) => {
  return await fetcherPut(`/api/finance/records/${id}`, payload);
};

export const deleteFinanceRecord = async (id: string) => {
  return await fetcherDelete(`/api/finance/records/${id}`);
};

export const createFinanceCategory = async (payload: {
  type: FinanceType;
  code: string;
  name: string;
  description?: string;
  houseId?: string | null;
}) => fetcherPost('/api/finance/categories', payload);

export const getFinanceCategories = async (type: FinanceType, houseId?: string, includeGlobal = true) => {
  const qs = new URLSearchParams({
    type,
    ...(houseId ? { houseId } : {}),
    includeGlobal: String(includeGlobal)
  }).toString();
  return await fetcher(`/api/finance/categories?${qs}`);
};

export const getFinanceSummary = async (houseId: string, year?: number, month?: number) => {
  const qs = new URLSearchParams({
    houseId,
    ...(year ? { year: String(year) } : {}),
    ...(month ? { month: String(month) } : {})
  }).toString();
  return await fetcher(`/api/finance/summary?${qs}`);
};

// (tuỳ chọn) lưu metadata file bill (nếu FE upload Cloudinary trước)
export const createFileAsset = async (payload: {
  url: string;
  provider?: 'cloudinary' | 's3' | 'local';
  mimeType?: string;
  bytes?: number;
  width?: number;
  height?: number;
  originalName?: string;
  uploadedBy?: string;
}) => {
  return await fetcherPost('/api/upload', payload);
};
