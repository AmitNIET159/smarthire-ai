'use client';

/**
 * ClientLayout
 * Client-side wrapper that provides AuthContext, Navbar, Toast notifications.
 */

import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a2e',
            color: '#f0f0f5',
            border: '1px solid rgba(148, 148, 184, 0.12)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '0.9rem',
          },
          success: {
            iconTheme: { primary: '#00cec9', secondary: '#1a1a2e' },
          },
          error: {
            iconTheme: { primary: '#ff7675', secondary: '#1a1a2e' },
          },
        }}
      />
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
    </AuthProvider>
  );
}
