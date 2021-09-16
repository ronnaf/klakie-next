import Cookies, { CookieAttributes } from 'js-cookie';

export const setCookie = (
  name: string,
  value: string,
  options?: CookieAttributes
) => {
  Cookies.set(name, value, {
    expires: 36500,
    domain: window.location.hostname,
    ...options,
  });
};
