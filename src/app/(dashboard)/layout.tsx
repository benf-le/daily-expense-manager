'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import MobileMenu from '@/components/MobileMenu';
import BudgetSetupModal from '@/components/BudgetSetupModal';
import { useLanguage } from '@/components/LanguageProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    let ignore = false;

    const fetchBudgetLimit = async () => {
      try {
        const response = await fetch('/api/users/me/budget');
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!ignore) {
          setShowBudgetSetup((data.budgetLimit ?? 0) <= 0);
        }
      } catch {
        if (!ignore) {
          setShowBudgetSetup(false);
        }
      }
    };

    fetchBudgetLimit();

    return () => {
      ignore = true;
    };
  }, [status, session?.user?.id]);

  if (status === 'loading') {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="app-layout">
      <Sidebar />
      <Navbar title={t.nav.dashboard} />
      <MobileMenu />
      <BudgetSetupModal
        isOpen={showBudgetSetup}
        onSaved={() => setShowBudgetSetup(false)}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
