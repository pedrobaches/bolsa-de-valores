// This file will contain server actions related to stock data

'use server';

interface StockData {
  symbol: string;
  name: string;
  price?: number;
  change?: number; // Or change percentage
  currency?: string;
}

// Predefined list of stocks for the dashboard
const dashboardStocks = [
  { symbol: 'PETR4.SA', name: 'Petrobras PN' },
  { symbol: 'VALE3.SA', name: 'Vale ON' },
  { symbol: 'ITUB4.SA', name: 'Itaú Unibanco PN' },
  { symbol: 'BBDC4.SA', name: 'Bradesco PN' },
  { symbol: 'ABEV3.SA', name: 'Ambev ON' },
  { symbol: 'UGPA3.SA', name: 'Ultrapar ON' },
];

// Yahoo Finance API endpoint for stock data
const YAHOO_FINANCE_API = 'https://query1.finance.yahoo.com/v8/finance/chart/';

export async function getDashboardStockData(): Promise<StockData[]> {
  const stockDataPromises = dashboardStocks.map(async (stock) => {
    try {
      // Construct the Yahoo Finance API URL with parameters
      const url = `${YAHOO_FINANCE_API}${stock.symbol}?region=BR&interval=1d&range=5d`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Error fetching data for ${stock.symbol}: ${response.statusText}`);
        return { ...stock }; // Return stock info without price/change
      }
      
      const data = await response.json();
      
      // Basic error handling
      if (!data || data.chart.error) {
        console.error(`Error in data for ${stock.symbol}:`, data?.chart?.error);
        return { ...stock }; // Return stock info without price/change
      }

      const result = data.chart.result[0];
      if (!result || !result.meta || !result.indicators || !result.indicators.quote || !result.indicators.quote[0]) {
        console.error(`Incomplete data structure for ${stock.symbol}`);
        return { ...stock };
      }

      const meta = result.meta;
      const quotes = result.indicators.quote[0];
      const timestamps = result.timestamp;

      // Find the most recent non-null closing price
      let latestPrice: number | null = null;
      let previousPrice: number | null = null;
      if (quotes.close && timestamps) {
          for (let i = quotes.close.length - 1; i >= 0; i--) {
              if (quotes.close[i] !== null && latestPrice === null) {
                  latestPrice = quotes.close[i];
                  // Try to get the price before the latest one for change calculation
                  if (i > 0 && quotes.close[i-1] !== null) {
                      previousPrice = quotes.close[i-1];
                  } else if (meta.chartPreviousClose) {
                      // Fallback to chartPreviousClose if the day before isn't in the range
                      previousPrice = meta.chartPreviousClose;
                  }
                  break;
              }
          }
      }

      let change: number | undefined = undefined;
      if (latestPrice !== null && previousPrice !== null) {
          change = latestPrice - previousPrice;
          // Optionally calculate percentage change: (latestPrice - previousPrice) / previousPrice * 100
      }

      return {
        ...stock,
        price: latestPrice ?? meta.regularMarketPrice, // Fallback to regularMarketPrice if needed
        change: change,
        currency: meta.currency,
      };

    } catch (error) {
      console.error(`Exception fetching data for ${stock.symbol}:`, error);
      return { ...stock }; // Return stock info even if API call fails
    }
  });

  // Wait for all API calls to complete
  const results = await Promise.all(stockDataPromises);
  return results;
}
