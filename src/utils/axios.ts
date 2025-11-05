import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import Router from 'next/router';
import { notifyError } from './notifier';

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return '';
}

const axiosServices = axios.create({
  baseURL: getBaseUrl()
});

function extractError(payload: any): { code: string; message: string } {
  // Text thuần
  if (typeof payload === 'string') {
    try {
      return extractError(JSON.parse(payload));
    } catch {
      return { code: 'RAW_TEXT', message: payload };
    }
  }

  // Blob/binary
  if (payload instanceof Blob) {
    return { code: 'BLOB_ERROR', message: 'Đã xảy ra lỗi không xác định' };
  }

  // Không có payload rõ ràng
  if (!payload || typeof payload !== 'object') {
    return { code: 'UNKNOWN_ERROR', message: 'Đã xảy ra lỗi không xác định' };
  }

  // 1) error là string: { error: "House code already exists" }
  if (typeof payload.error === 'string' && payload.error.trim()) {
    return { code: payload.errorCode || 'API_ERROR', message: payload.error };
  }

  // 2) Các cấu trúc phổ biến khác
  const code = payload?.error?.errorCode || payload?.errorCode || payload?.code || payload?.statusCode || payload?.status || 'API_ERROR';

  const message =
    payload?.error?.message || // { error: { message } }
    payload?.message || // { message }
    payload?.error_description || // OAuth2/OpenID
    (Array.isArray(payload?.errors) && (payload.errors[0]?.message || payload.errors[0])) ||
    payload?.detail ||
    payload?.title || // RFC7807 problem+json
    'Đã xảy ra lỗi không xác định';

  return { code: String(code), message: String(message) };
}

/** Một số API trả success = { status: 0 } coi như lỗi logic */
function isLogicalError(data: any) {
  return (
    data && typeof data === 'object' && !Array.isArray(data) && Object.prototype.hasOwnProperty.call(data, 'status') && data.status === 0
  );
}

axiosServices.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('accessToken');
    const slugCompany = Cookies.get('slugCompany');

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    if (slugCompany) {
      config.headers.set('X-Company-Slug', slugCompany);
    }

    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosServices.interceptors.response.use(
  // ✅ SUCCESS
  (response: AxiosResponse<any>) => {
    const { data } = response;

    // Nếu API dùng "status: 0" cho lỗi logic
    if (isLogicalError(data)) {
      const { code, message } = extractError(data);
      notifyError(code, message);
      return Promise.reject({ code, message, origin: data });
    }

    // Mặc định trả "data" để phần gọi dùng chung
    return data;
  },

  // ❌ ERROR
  async (error: AxiosError<any>) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;

    // Lấy code/message linh hoạt
    const { code, message } = extractError(payload ?? error.message);

    // 401 → về /login
    if (status === 401 && typeof window !== 'undefined') {
      try {
        Router.push('/login');
      } catch {}
    }

    // Hạ tầng lỗi
    if ([502, 503, 504].includes(status)) {
      notifyError('SERVER_UNAVAILABLE', 'Hệ thống đang bảo trì hoặc mất kết nối');
    } else {
      notifyError(code, message);
    }

    return Promise.reject(
      Object.assign(error, {
        friendly: { code, message, status }
      })
    );
  }
);

export default axiosServices;

/** Helpers */
export const fetcherPost = async <T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T> | any> => {
  return await axiosServices.post<T>(url, body, config);
};
export const fetcherPut = async <T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T> | any> => {
  return await axiosServices.put<T>(url, body, config);
};
export const fetcher = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T | any> => {
  return await axiosServices.get(url, config);
};
export const fetcherDelete = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T> | any> => {
  return await axiosServices.delete<T>(url, config);
};
export const fetcherPatch = async <T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T> | any> => {
  return await axiosServices.patch<T>(url, body, config);
};
