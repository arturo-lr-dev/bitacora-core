'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  role?: 'ADMIN' | 'WORKER';
  labels: {
    projects: string;
    reports: string;
  };
}

export function MobileNav({ role, labels }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  if (role !== 'ADMIN') return null;

  const overlayAndNav = (
    <>
      {/* Overlay - Cubre toda la pantalla */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidenav */}
      <div
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-border shadow-xl z-[46] transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="bg-white p-4 space-y-3">
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg text-base font-semibold transition-colors ${
              isActive('/admin')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            {labels.projects}
          </Link>
          <Link
            href="/admin/reports"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-6 py-4 rounded-lg text-base font-semibold transition-colors ${
              isActive('/admin/reports')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
            {labels.reports}
          </Link>
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Botón Hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted"
        aria-label="Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Render overlay y nav en body usando portal */}
      {mounted && typeof document !== 'undefined' && createPortal(overlayAndNav, document.body)}
    </>
  );
}
