"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNamespace } from './namespaceContext';
import { useLocale, useTranslations } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';

export default function Sidebar() {
  const pathname = usePathname();
  const { namespaces, selectedNamespace, setSelectedNamespace } = useNamespace();

  return (
    <NextIntlClientProvider locale={pathname?.split('/')[1] || 'en'}>
      <SidebarContent
        pathname={pathname}
        namespaces={namespaces}
        selectedNamespace={selectedNamespace}
        setSelectedNamespace={setSelectedNamespace}
      />
    </NextIntlClientProvider>
  );
}

function SidebarContent({
  pathname,
  namespaces,
  selectedNamespace,
  setSelectedNamespace
}: {
  pathname: string | null;
  namespaces: string[];
  selectedNamespace: string;
  setSelectedNamespace: (ns: string) => void;
}) {
  const locale = useLocale();
  const t = useTranslations();

  const isActive = (path: string) => {
    const currentPath = pathname || '';
    return currentPath === `/${locale}${path}`;
  };

  return (
    <aside className="w-64 bg-white shadow-md h-screen fixed top-0 left-0">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{t('navigation.dashboard')}</h2>

        <div className="mb-6">
          <label htmlFor="namespace" className="block text-sm font-medium text-gray-700 mb-2">
            {t('common.namespace')}
          </label>
          <select
            id="namespace"
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          >
            {namespaces.map((ns) => (
              <option key={ns} value={ns}>
                {ns}
              </option>
            ))}
          </select>
        </div>

        <nav>
          <ul className="space-y-2">
            <li>
              <Link href={`/${locale}`}>
                <span
                  className={`block p-2 text-gray-600 hover:bg-gray-200 rounded-md ${isActive('') ? 'bg-gray-300' : ''}`}
                >
                  {t('navigation.nodes')}
                </span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/events`}>
                <span
                  className={`block p-2 text-gray-600 hover:bg-gray-200 rounded-md ${isActive('/events') ? 'bg-gray-300' : ''}`}
                >
                  {t('navigation.events')}
                </span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/pods`}>
                <span
                  className={`block p-2 text-gray-600 hover:bg-gray-200 rounded-md ${isActive('/pods') ? 'bg-gray-300' : ''}`}
                >
                  {t('navigation.pods')}
                </span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/alerts`}>
                <span
                  className={`block p-2 text-gray-600 hover:bg-gray-200 rounded-md ${isActive('/alerts') ? 'bg-gray-300' : ''}`}
                >
                  {t('navigation.alerts')}
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}