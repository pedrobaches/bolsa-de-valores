export const runtime = 'edge';

import React from 'react';
import StockList from '@/components/StockList';
import StockSearch from '@/components/StockSearch';
import TriggeredAlerts from '@/components/TriggeredAlerts';
import { checkAlerts } from './stock/alertActions';

export default async function HomePage() {
  // Check for any triggered alerts when the page loads
  const triggeredAlerts = await checkAlerts();

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-24 bg-white dark:bg-zinc-900">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <div className="header-gradient">
          <div className="flex flex-col items-center lg:items-start">
            <h1 className="text-xl font-bold text-primary-blue dark:text-secondary-blue">
              Painel de Investimentos
            </h1>
            <p className="text-xs text-secondary-green mt-1">
              Desenvolvido para Pedro Baches Jorge
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl space-y-8">
        {/* Display any triggered alerts at the top */}
        {triggeredAlerts.length > 0 && (
          <TriggeredAlerts alerts={triggeredAlerts} />
        )}
        
        {/* Search component */}
        <StockSearch />

        {/* Stock list component */}
        {/* @ts-expect-error Server Component */}
        <StockList />
      </div>
      
      <footer className="footer-text">
        <p>© {new Date().getFullYear()} | Painel Pessoal de Pedro Baches Jorge</p>
      </footer>
    </main>
  );
}
