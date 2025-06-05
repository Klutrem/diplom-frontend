import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import '../globals.css';

export default async function RootLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>; // Явно указываем, что params — это Promise
}) {
    const { locale } = await params; // Ждём получения параметров
    let messages;
    try {
        messages = (await import(`@/messages/${locale}.json`)).default;
    } catch (error) {
        notFound();
    }

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

export function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'ru' }]; // Статические локали
}