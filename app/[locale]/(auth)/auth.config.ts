import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      
      // Handle locale-prefixed paths
      const pathWithoutLocale = pathname.replace(/^\/(?:en|th)/, '');
      
      const isOnChat = pathWithoutLocale === '/';
      const isOnRegister = pathWithoutLocale === '/register';
      const isOnLogin = pathWithoutLocale === '/login';

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        // Redirect to home page with current locale
        const locale = pathname.match(/^\/(?:en|th)/)?.[0] || '';
        return Response.redirect(new URL(`${locale}/`, nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin) {
        return true; // Always allow access to register and login pages
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn) {
        // Redirect to home page with current locale
        const locale = pathname.match(/^\/(?:en|th)/)?.[0] || '';
        return Response.redirect(new URL(`${locale}/`, nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
