import { defineMiddleware } from 'astro:middleware';
import {
  isAdminAuthenticated,
  isProtectedAdminApi,
  isProtectedAdminPage,
} from '@/lib/adminSession';
import { isInvalidLocalePrefix } from '@/lib/i18n/lang';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const authed = isAdminAuthenticated(context.request);

  if (isInvalidLocalePrefix(pathname)) {
    return context.rewrite('/404');
  }

  if (pathname === '/admin') {
    if (authed) {
      return context.redirect('/admin/dashboard');
    }
    return next();
  }

  if (isProtectedAdminApi(pathname)) {
    if (!authed) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return next();
  }

  if (isProtectedAdminPage(pathname)) {
    if (!authed) {
      return context.redirect('/admin');
    }
    return next();
  }

  return next();
});
