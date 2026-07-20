/**
 * PCOS Root Layout — v1.2 (Phase H — QA-H-003 aligned)
 * =======================================================
 * Phase H change: Shell is no longer rendered here.
 * Each page renders its own Shell with its own TopBar via the header prop.
 * This is required by the QA-H-003 fix (single TopBar per route).
 *
 * This layout provides:
 * - HTML boilerplate
 * - Font variables
 * - Global metadata
 * - ToastProvider (must remain at root level for useToast() hook access)
 * - Skip-to-content link
 *
 * Shell ownership: each page.tsx
 */

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const geistSans = localFont({
  src: '../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2',
  variable: '--geist-sans',
  display: 'swap',
});

const geistMono = localFont({
  src: '../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2',
  variable: '--geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default:  'PCOS — Personal Cognitive Operating System',
    template: '%s · PCOS',
  },
  description:
    'A personal cognitive operating system. Memory compounds, intelligence persists, providers are interchangeable infrastructure.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg font-sans text-fg antialiased selection:bg-brand selection:bg-opacity-20 selection:text-brand">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only fixed left-4 top-4 z-[9999] rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand"
        >
          Skip to main content
        </a>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
