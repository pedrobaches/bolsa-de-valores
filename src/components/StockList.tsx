import React from 'react';
import { getDashboardStockData } from '@/app/stockActions'; // Import the server action

// Define the structure of the data we expect after fetching
interface StockDisplayData {
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  currency?: string;
}

// Make the component async to fetch data
const StockList: React.FC = async () => {
  // Fetch data using the server action
  const stocks: StockDisplayData[] = await getDashboardStockData();

  // Helper to format currency
  const formatCurrency = (value: number | undefined, currency: string | undefined) => {
    if (value === undefined || currency === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency }).format(value);
  };

  // Helper to format change and determine color
  const formatChange = (change: number | undefined) => {
    if (change === undefined) return { text: '-', color: 'text-gray-500' };
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
    return { text: `${sign}${change.toFixed(2)}`, color };
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-zinc-800/50 dark:border-neutral-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Ações Principais</h2>
      <ul className="space-y-3">
        {stocks.map((stock) => {
          const changeInfo = formatChange(stock.change);
          return (
            <li key={stock.symbol} className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-neutral-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-zinc-700/50 rounded-md transition-colors duration-150">
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{stock.symbol}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{stock.name}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(stock.price, stock.currency)}</span>
                <span className={`ml-3 text-sm ${changeInfo.color}`}>{changeInfo.text}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StockList;

