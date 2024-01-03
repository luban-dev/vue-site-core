import axios, { AxiosHeaders } from 'axios';

export interface ProgressEvent {
  loaded: number;
  total?: number;
  progress?: number;
  bytes?: number;
  estimated?: number;
  rate?: number;
}

export interface RequestOptions {
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

export interface RequestResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers | Record<string, string>;
}

export const request = <T>(opts: RequestOptions) => {
  const url = typeof opts.url === 'string' ? opts.url : opts.url.toString();
  const baseURL = typeof opts.baseURL === 'string' ? opts.baseURL : opts.baseURL?.toString();

  // headers
  let headers: Record<string, string> = {};
  if (opts.headers instanceof Headers) {
    for (const pair of opts.headers.entries()) {
      headers[pair[0]] = pair[1];
    }
  } else if (opts.headers) {
    headers = opts.headers;
  }

  const controller = new AbortController();

  const promise = axios({
    url,
    baseURL,
    method: opts.method,
    headers,
    params: opts.query,
    timeout: opts.timeout,
    withCredentials: opts.credentials === 'include',
    responseType: opts.responseType,
    validateStatus: opts.validateStatus,
    onDownloadProgress: (evt) => {
      opts.onProgress?.({
        ...evt
      });
    },
    onUploadProgress: (evt) => {
      opts.onProgress?.({
        ...evt
      });
    },
    signal: controller.signal
  }).then((res) => {
    const headers = res.headers instanceof AxiosHeaders ? res.headers.normalize(false).toJSON(true) : res.headers;

    return {
      status: res.status,
      statusText: res.statusText,
      data: res.data as T,
      headers: headers as RequestResponse<T>['headers']
    };
  });

  return {
    cancel: () => {
      controller.abort();
    },
    response: promise
  };
};
