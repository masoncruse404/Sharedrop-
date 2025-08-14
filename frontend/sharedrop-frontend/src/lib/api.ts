import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://api.sharedrop.masoncruse.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ================== Auth API ==================
export const authAPI = {
  register: async (userData: { email: string; username: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    const { access_token } = response.data;

    Cookies.set('access_token', access_token, {
      expires: 1,
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
    });

    return response.data;
  },

  logout: () => {
    Cookies.remove('access_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ================== Users API ==================
export const usersAPI = {
  getStorage: async () => {
    const response = await api.get('/me/storage');
    return response.data;
  },
};

// ================== Files API ==================
export const filesAPI = {
  uploadFile: async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  getFiles: async (skip = 0, limit = 100) => {
    const response = await api.get('/files/', { params: { skip, limit } });
    return response.data;
  },

  getFile: async (fileId: number) => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },

  downloadFile: async (fileId: number) => {
    const response = await api.get(`/files/${fileId}/download`, { responseType: 'blob' });
    return response;
  },

  shareFile: async (fileId: number) => {
    const response = await api.post(`/files/${fileId}/share`);
    return response.data;
  },

  renameFile: async (fileId: number, newName: string) => {
    const formData = new FormData();
    formData.append('new_name', newName);

    const response = await api.put(`/files/${fileId}/rename`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteFile: async (fileId: number) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  downloadSharedFile: async (shareToken: string) => {
    const response = await axios.get(`${API_BASE_URL}/files/shared/${shareToken}`, {
      responseType: 'blob',
    });
    return response;
  },
};

export { api as default };
