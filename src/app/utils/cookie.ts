import { CookieOptions, Request, Response } from "express";

// !set cookie  fun
const setCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(key, value, options);
};

// !get cookie  fun
const getCookie = (req: Request, key: string) => {
  return req.cookies[key];
};

// !clear cookie  fun
const clearCookie = (res: Response, key: string, options: CookieOptions) => {
  res.clearCookie(key, options);
};

export const cookieUtils = {
  setCookie,
  getCookie,
  clearCookie,
};
