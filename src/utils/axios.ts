import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import Router from 'next/router';
import { notifyError } from './notifier';

const axiosServices = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL
});

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
  (response: AxiosResponse<any>) => {
    const { data } = response;

    // Trường hợp data là object có `status` === 0 → lỗi logic
    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      Object.prototype.hasOwnProperty.call(data, 'status') &&
      data.status === 0
    ) {
      const errorCode = data?.error?.errorCode || data?.errorCode || 'UNKNOWN_ERROR';
      const message = data?.error?.message || data?.message || errorCode;

      notifyError(errorCode, message);
      return Promise.reject({ errorCode, message, origin: data });
    }

    // Trả về `data` nếu là object hoặc array → dùng chung được mọi loại response
    return data;
  },

  (error: AxiosError<any>) => {
    const response = error.response;

    const errorCode = response?.data?.error?.errorCode || response?.data?.errorCode || response?.status?.toString() || 'NETWORK_ERROR';
    const message = response?.data?.error?.message || response?.data?.message || error.message;

    if (response?.status === 401 && typeof window !== 'undefined') {
      Router.push('/login');
    }

    if ([502, 503, 504].includes(response?.status ?? 0)) {
      notifyError('SERVER_UNAVAILABLE', 'Hệ thống đang bảo trì hoặc mất kết nối');
    } else {
      notifyError(errorCode, message);
    }

    return Promise.reject(error);
  }
);

export default axiosServices;

export const fetcherPost = async <T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return await axiosServices.post<T>(url, body, config);
};

export const fetcherPut = async <T = any>(url: string, body?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return await axiosServices.put<T>(url, body, config);
};
export const fetcher = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return await axiosServices.get(url, config);
};

export const fetcherDelete = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  return await axiosServices.delete<T>(url, config);
};
