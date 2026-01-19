'use client';

import { WTISManagement } from '@/components/modules/water-tax/ratemaster/WTISManagement';
import { Language } from '@/app/page';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {Sidebar }from '@/components/layout/Sidebar';

export default function RateMasterPage() {
  const language: Language = 'en'; // Set your default language

  return (
    <div className="flex min-h-screen bg-[#F8FBFF]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">
          <WTISManagement language={language} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
