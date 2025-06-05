import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'ru' }];
}

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const locale = params.locale;
    let messages;
    try {
        messages = (await import(`@/messages/${locale}.json`)).default;
    } catch (error) {
        notFound();
    }

    return (
        <html lang={locale}>
            <body className={inter.className}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <div className="min-h-screen bg-gray-50">
                        <nav className="bg-white shadow-sm">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex justify-between h-16">
                                    <div className="flex">
                                        <div className="flex-shrink-0 flex items-center">
                                            <LanguageSwitcher />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </nav>
                        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                            {children}
                        </main>
                    </div>
                </NextIntlClientProvider>
            </body>
        </html>
    );
} 