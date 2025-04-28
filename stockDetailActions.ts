'use server';

// This file will contain server actions related to fetching stock details

interface StockDetailData {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  currency?: string;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  marketCap?: number;
  recommendation?: string; // For buy/hold/sell recommendation
  tradingStrategy?: string; // For buy & hold or day trade recommendation
}

// Yahoo Finance API endpoint for stock data
const YAHOO_FINANCE_API = 'https://query1.finance.yahoo.com/v8/finance/chart/';

export async function getStockDetail(symbol: string): Promise<StockDetailData> {
  try {
    // Construct the Yahoo Finance API URL with parameters
    const url = `${YAHOO_FINANCE_API}${symbol}?region=BR&interval=1d&range=5d`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Error fetching data for ${symbol}: ${response.statusText}`);
      return { symbol }; // Return just the symbol if there's an error
    }
    
    const data = await response.json();
    
    // Basic error handling
    if (!data || data.chart.error) {
      console.error(`Error in data for ${symbol}:`, data?.chart?.error);
      return { symbol }; // Return just the symbol if there's an error
    }

    const result = data.chart.result[0];
    if (!result || !result.meta || !result.indicators || !result.indicators.quote || !result.indicators.quote[0]) {
      console.error(`Incomplete data structure for ${symbol}`);
      return { symbol };
    }

    const meta = result.meta;
    const quotes = result.indicators.quote[0];
    const timestamps = result.timestamp;

    // Find the most recent non-null closing price
    let latestPrice: number | null = null;
    let previousPrice: number | null = null;
    let latestOpen: number | null = null;
    let latestHigh: number | null = null;
    let latestLow: number | null = null;
    let latestVolume: number | null = null;

    if (quotes.close && timestamps) {
      for (let i = quotes.close.length - 1; i >= 0; i--) {
        if (quotes.close[i] !== null && latestPrice === null) {
          latestPrice = quotes.close[i];
          latestOpen = quotes.open?.[i] ?? null;
          latestHigh = quotes.high?.[i] ?? null;
          latestLow = quotes.low?.[i] ?? null;
          latestVolume = quotes.volume?.[i] ?? null;
          
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
    let changePercent: number | undefined = undefined;
    if (latestPrice !== null && previousPrice !== null) {
      change = latestPrice - previousPrice;
      changePercent = (change / previousPrice) * 100;
    }

    // Simple logic for recommendations (this would be more sophisticated in a real app)
    let recommendation = 'Neutro';
    if (change && change > 0) {
      recommendation = 'Compra';
    } else if (change && change < 0) {
      recommendation = 'Venda';
    }

    // Simple logic for trading strategy (this would be more sophisticated in a real app)
    // For now, just a placeholder based on volatility
    let tradingStrategy = 'Buy & Hold';
    if (latestHigh && latestLow && latestPrice) {
      const dailyVolatility = (latestHigh - latestLow) / latestPrice;
      if (dailyVolatility > 0.02) { // If daily range is more than 2% of price
        tradingStrategy = 'Day Trade';
      }
    }

    // Extract the name from the symbol or use a placeholder
    // In a real app, we would have a more robust way to get the company name
    const name = meta.shortName || meta.longName || symbol.split('.')[0];

    return {
      symbol,
      name,
      price: latestPrice ?? undefined,
      change,
      changePercent,
      currency: meta.currency,
      volume: latestVolume ?? undefined,
      open: latestOpen ?? undefined,
      high: latestHigh ?? undefined,
      low: latestLow ?? undefined,
      previousClose: previousPrice ?? undefined,
      marketCap: meta.marketCap,
      recommendation,
      tradingStrategy,
    };

  } catch (error) {
    console.error(`Exception fetching data for ${symbol}:`, error);
    return { symbol }; // Return just the symbol if there's an exception
  }
}
