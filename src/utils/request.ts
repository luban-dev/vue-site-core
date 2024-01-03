import axios, { AxiosHeaders } from 'axios';
import type { ApiRequest, ApiRequestOptions, ApiRequestResponse } from '@/types';

export const request: ApiRequest = <T>(opts: ApiRequestOptions) => {
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
      headers: headers as ApiRequestResponse<T>['headers']
    };
  });

  return {
    cancel: () => {
      controller.abort();
    },
    response: promise
  };
};
