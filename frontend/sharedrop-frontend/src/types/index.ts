export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface FileItem {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type?: string;
  uploaded_at: string;
  share_token?: string;
}

export interface FileList {
  files: FileItem[];
  total: number;
}

export interface ShareLinkResponse {
  share_url: string;
  share_token: string;
}

export interface FileUploadResponse {
  message: string;
  file: FileItem;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  username: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}
