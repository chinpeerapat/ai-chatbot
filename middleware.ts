import { authConfig } from '@/app/[locale]/(auth)/auth.config';
import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const authMiddleware = NextAuth(authConfig).auth;

export default function middleware(req: NextRequest) {
  const publicPaths = ['/login', '/register'];
  const isPublicPage = publicPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Handle i18n routing first
  const response = handleI18nRouting(req);
  if (response) return response;

  // Apply auth middleware to non-public pages
  if (!isPublicPage) {
    return authMiddleware(req as any);
  }

  return response;
}

export const config = {
  matcher: ['/', '/:id', '/api/:path*', '/login', '/register'],
};