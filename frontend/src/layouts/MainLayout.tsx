import { Outlet } from 'react-router-dom';

import { Footer } from 'components/Footer';
import { Navbar } from 'components/Navbar';
import { WhatsAppFloat } from 'components/WhatsAppFloat';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-grain text-ink">
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-0">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
    </div>
  );
}
