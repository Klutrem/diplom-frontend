import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'ru'],

    // Used when no locale matches
    defaultLocale: 'en',

    // This is the default path that will be used when visiting a non-localized path
    localePrefix: 'always'
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(ru|en)/:path*']
}; 