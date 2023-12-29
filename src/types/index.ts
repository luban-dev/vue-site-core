export interface ProgressEvent {
  loaded: number;
  total: number;
  progress?: number;
  bytes?: number;
  estimated?: number;
  rate?: number;
  upload?: boolean;
  download?: boolean;
}

export declare function ApiRequest<T>(opts: {
  url: string | URL | Request;
  baseURL?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, string> | URLSearchParams;
  data?: string | FormData | Record<string, string | Blob> | Blob | URLSearchParams | BufferSource;
  headers?: Headers | Record<string, string>;
  mode?: 'cors' | 'no-cors' | 'same-origin';
  credentials?: 'omit' | 'same-origin' | 'include';
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
  redirect?: 'follow' | 'error' | 'manual';
  referrer?: string | 'no-referrer' | 'client' | URL;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'unsafe-url';
  integrity: string;
  responseType?: 'json' | 'blob' | 'text' | 'formData' | 'arrayBuffer';
  onProgress?: (event: ProgressEvent) => void;
}): {
  cancel: () => void;
  response: Promise<{
    data: T;
    status: number;
    statusText: string;
    headers: Headers | Record<string, string>;
  }>;
};
