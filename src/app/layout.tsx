import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import ToastProvider from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Daily Expense Manager - Quản lý thu chi',
  description: 'Ứng dụng quản lý thu chi cá nhân hàng ngày. Theo dõi income, outcome, ngân sách và cảnh báo vượt mức.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
