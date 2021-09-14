import { k } from './constants';

export const fetcher = (input: RequestInfo, init?: RequestInit) => {
  const apiKey = localStorage.getItem(k.API_KEY_KEY) || '';
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      'x-api-key': apiKey,
    },
  }).then((res) => res.json());
};
