'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const handleLanguageChange = (newLocale: string) => {
        startTransition(() => {
            const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
            router.replace(`/${newLocale}${pathWithoutLocale}`);
        });
    };

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1 rounded ${locale === 'en'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                disabled={isPending}
            >
                EN
            </button>
            <button
                onClick={() => handleLanguageChange('ru')}
                className={`px-3 py-1 rounded ${locale === 'ru'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                disabled={isPending}
            >
                RU
            </button>
        </div>
    );
} 