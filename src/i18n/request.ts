import { getRequestConfig } from 'next-intl/server';
import type { GetRequestConfigParams } from 'next-intl/server';

export default getRequestConfig(async ({ locale }: GetRequestConfigParams) => ({
    locale: locale || 'en',
    messages: (await import(`../messages/${locale || 'en'}.json`)).default,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    now: new Date(),
}));