import type { Response, Request, CookieOptions } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export const cookies = {
  getOptions: (): CookieOptions => ({
    httpOnly: true,
    // Must be secure ONLY in production (requires HTTPS)
    secure: isProduction,
    // On localhost dev, 'lax' is fine if proxied or same-domain port-to-port.
    // If strict cross-site cookies are needed on HTTP localhost, 'lax' is safer than 'none'.
    // 'none' forces secure:true which breaks standard http://localhost setups.
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    path: '/',
  }),

  set: (res: Response, name: string, value: string, options: CookieOptions = {}) => {
    res.cookie(name, value, { ...cookies.getOptions(), ...options });
  },

  clear: (res: Response, name: string, options: CookieOptions = {}) => {
    const clearOptions = cookies.getOptions();
    delete clearOptions.maxAge;
    res.clearCookie(name, { ...clearOptions, ...options });
  },

  get: (req: Request, name: string): string | undefined => {
    return req.cookies?.[name];
  },
};
