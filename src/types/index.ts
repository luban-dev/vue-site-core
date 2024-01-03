export interface ProgressEvent {
  loaded: number;
  total?: number;
  progress?: number;
  bytes?: number;
  estimated?: number;
  rate?: number;
}

export interface ApiRequestOptions {
  url: string | URL | Request;
  baseURL?: string | URL;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
  query?: Record<string, string> | URLSearchParams;
  data?: string | FormData | Record<string, any> | File | Blob | URLSearchParams | BufferSource;
  headers?: Headers | Record<string, string>;
  mode?: 'cors' | 'no-cors' | 'same-origin';
  credentials?: 'omit' | 'same-origin' | 'include';
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
  redirect?: 'follow' | 'error' | 'manual';
  referrer?: string | 'no-referrer' | 'client' | URL;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'unsafe-url';
  integrity: string;
  responseType?: 'json' | 'blob' | 'text' | 'stream' | 'arraybuffer';
  timeout?: number;
  onProgress?: (event: ProgressEvent) => void;
  validateStatus?: (status: number) => boolean;
}

export interface ApiRequestResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers | Record<string, string>;
}

export declare function apiRequest<T>(opts: ApiRequestOptions): {
  cancel: () => void;
  response: Promise<ApiRequestResponse<T>>;
};

export type ApiRequest = typeof apiRequest;
