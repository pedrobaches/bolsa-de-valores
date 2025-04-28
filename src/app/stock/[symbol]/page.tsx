import React from 'react';
import { getStockDetail } from '../stockDetailActions';
import AlertForm from '@/components/AlertForm';

// Define the props expected by the page, including the dynamic parameter
interface StockDetailPageProps {
  params: {
    symbol: string; // The dynamic part of the URL, e.g., 'PETR4.SA'
  };
}

export const runtime = 'edge';

// This is the page component for the dynamic route /stock/[symbol]
const StockDetailPage: React.FC<StockDetailPageProps> = async ({ params }) => {
  const { symbol } = params; // Extract the symbol from the URL parameters

  // Decode the symbol in case it's URL-encoded (e.g., %2E for '.')
  const decodedSymbol = decodeURIComponent(symbol);
  
  // Fetch detailed data for this stock
  const stockData = await getStockDetail(decodedSymbol);

  // Helper to format currency
  const formatCurrency = (value: number | undefined, currency: string | undefined) => {
    if (value === undefined || currency === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency }).format(value);
  };

  // Helper to format change and determine color
  const formatChange = (change: number | undefined) => {
    if (change === undefined) return { text: '-', color: 'text-gray-500' };
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? 'text-primary-green' : change < 0 ? 'text-red-600' : 'text-gray-500';
    return { text: `${sign}${change.toFixed(2)}`, color };
  };

  // Helper to format percentage
  const formatPercent = (percent: number | undefined) => {
    if (percent === undefined) return '-';
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  // Determine recommendation color
  const getRecommendationColor = (recommendation: string | undefined) => {
    if (!recommendation) return 'text-gray-500';
    if (recommendation === 'Compra') return 'text-primary-green';
    if (recommendation === 'Venda') return 'text-red-600';
    return 'text-yellow-500'; // Neutro
  };

  // Determine strategy color
  const getStrategyColor = (strategy: string | undefined) => {
    if (!strategy) return 'text-gray-500';
    if (strategy === 'Buy & Hold') return 'text-primary-blue';
    if (strategy === 'Day Trade') return 'text-purple-600';
    return 'text-gray-500';
  };

  const changeInfo = formatChange(stockData.change);

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

      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-2 text-primary-blue dark:text-secondary-blue">
          {stockData.name || decodedSymbol}
        </h1>
        <p className="text-xl mb-6 text-secondary-green dark:text-secondary-green">{decodedSymbol}</p>
        
        {/* Stock price and change */}
        <div className="card border-primary-blue">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-4xl font-bold text-primary-blue dark:text-secondary-blue">
                {formatCurrency(stockData.price, stockData.currency)}
              </span>
              <span className={`ml-3 text-xl ${changeInfo.color}`}>
                {changeInfo.text} ({formatPercent(stockData.changePercent)})
              </span>
            </div>
            <div className="text-right">
              <div className={`text-lg font-semibold ${getRecommendationColor(stockData.recommendation)}`}>
                Recomendação: {stockData.recommendation || 'Neutro'}
              </div>
              <div className={`text-md ${getStrategyColor(stockData.tradingStrategy)}`}>
                Estratégia: {stockData.tradingStrategy || 'Indefinida'}
              </div>
            </div>
          </div>
          
          {/* Stock details grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-3 bg-light-blue dark:bg-zinc-700/50 rounded">
              <div className="text-sm text-gray-500 dark:text-gray-400">Abertura</div>
              <div className="font-medium">{formatCurrency(stockData.open, stockData.currency)}</div>
            </div>
            <div className="p-3 bg-light-blue dark:bg-zinc-700/50 rounded">
              <div className="text-sm text-gray-500 dark:text-gray-400">Máxima</div>
              <div className="font-medium">{formatCurrency(stockData.high, stockData.currency)}</div>
            </div>
            <div className="p-3 bg-light-blue dark:bg-zinc-700/50 rounded">
              <div className="text-sm text-gray-500 dark:text-gray-400">Mínima</div>
              <div className="font-medium">{formatCurrency(stockData.low, stockData.currency)}</div>
            </div>
            <div className="p-3 bg-light-blue dark:bg-zinc-700/50 rounded">
              <div className="text-sm text-gray-500 dark:text-gray-400">Fechamento Anterior</div>
              <div className="font-medium">{formatCurrency(stockData.previousClose, stockData.currency)}</div>
            </div>
            <div className="p-3 bg-light-blue dark:bg-zinc-700/50 rounded">
              <div className="text-sm text-gray-500 dark:text-gray-400">Volume</div>
              <div className="font-medium">{stockData.volume?.toLocaleString('pt-BR') || '-'}</div>
            </div>
          </div>
        </div>

        {/* Add the AlertForm component */}
        <AlertForm symbol={decodedSymbol} currentPrice={stockData.price} />
        
        {/* Placeholder for chart - to be implemented later */}
        <div className="card border-primary-green">
          <h2 className="text-xl font-semibold mb-4 text-primary-green dark:text-secondary-green">Gráfico</h2>
          <div className="h-64 bg-light-green dark:bg-zinc-700/50 rounded flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Gráfico será implementado em breve...</p>
          </div>
        </div>

        {/* Link to go back to the dashboard */}
        <div className="mt-8">
          <a href="/" className="text-primary-blue hover:underline dark:text-secondary-blue">
            &larr; Voltar ao Dashboard
          </a>
        </div>
      </div>
      
      <footer className="footer-text">
        <p>© {new Date().getFullYear()} | Painel Pessoal de Pedro Baches Jorge</p>
      </footer>
    </main>
  );
};

export default StockDetailPage;
