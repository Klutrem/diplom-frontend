"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNamespace } from './namespaceContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { namespaces, selectedNamespace, setSelectedNamespace } = useNamespace();

  return (
    <aside className="w-64 bg-white shadow-md h-screen fixed top-0 left-0">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Monitoring Dashboard</h2>

        <div className="mb-6">
          <label htmlFor="namespace" className="block text-sm font-medium text-gray-700 mb-2">
            Namespace
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
              <Link href="/">
                <span
                  className={`block p-2 text-gray-600 hover:bg-gray-200 rounded-md ${
                    pathname === '/' ? 'bg-gray-300' : ''
                  }`}
                >
                  Nodes
                </span>
              </Link>
            </li>
            <li>
              <Link href="/pods">
                <span
                  className={`block p-2 text-gray-600 hover:bg-gray-200 rounded-md ${
                    pathname === '/pods' ? 'bg-gray-300' : ''
                  }`}
                >
                  Pods
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}