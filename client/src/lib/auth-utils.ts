import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { AuthTokens } from '@/types/api';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export function setAuthTokens(tokens: AuthTokens): void {
  setCookie(ACCESS_TOKEN_KEY, tokens.access, {
    maxAge: 60 * 60, // 1 hour
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  
  setCookie(REFRESH_TOKEN_KEY, tokens.refresh, {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  
  setCookie(USER_KEY, JSON.stringify(tokens.user), {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function getAccessToken(): string | null {
  const token = getCookie(ACCESS_TOKEN_KEY);
  return token ? String(token) : null;
}

export function getRefreshToken(): string | null {
  const token = getCookie(REFRESH_TOKEN_KEY);
  return token ? String(token) : null;
}

export function getUser(): AuthTokens['user'] | null {
  const userStr = getCookie(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(String(userStr));
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
  deleteCookie(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

