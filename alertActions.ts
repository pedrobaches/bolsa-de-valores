'use server';

import { getRequestContext } from "@cloudflare/next-on-pages";

// Add the edge runtime configuration
export const runtime = 'edge';

interface AlertInput {
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
}

interface Alert {
  id: number;
  symbol: string;
  target_price: number;
  condition: "above" | "below";
  created_at: string;
  last_checked_at: string | null;
  triggered_at: string | null;
  is_active: boolean;
}

export async function createAlert(alert: AlertInput): Promise<void> {
  try {
    const context = getRequestContext();
    const db = context.env.DB; // Get the D1 database binding

    await db.prepare(
      "INSERT INTO Alerts (symbol, target_price, condition) VALUES (?, ?, ?)"
    ).bind(alert.symbol, alert.targetPrice, alert.condition).run();

    console.log("Alert created successfully for:", alert.symbol);

  } catch (error) {
    console.error("Error creating alert in database:", error);
    throw new Error("Failed to create alert."); // Re-throw error to be caught by the form
  }
}

export async function getActiveAlerts(): Promise<Alert[]> {
  try {
    const context = getRequestContext();
    const db = context.env.DB;

    const result = await db.prepare(
      "SELECT * FROM Alerts WHERE is_active = true ORDER BY created_at DESC"
    ).all();

    return result.results as Alert[];
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
}

export async function checkAlerts(): Promise<Alert[]> {
  try {
    const context = getRequestContext();
    const db = context.env.DB;
    
    // Get all active alerts that haven't been triggered yet
    const alerts = await db.prepare(
      "SELECT * FROM Alerts WHERE is_active = true AND triggered_at IS NULL"
    ).all();
    
    if (!alerts.results.length) {
      return [];
    }
    
    // Group alerts by symbol to minimize API calls
    const alertsBySymbol: Record<string, Alert[]> = {};
    (alerts.results as Alert[]).forEach(alert => {
      if (!alertsBySymbol[alert.symbol]) {
        alertsBySymbol[alert.symbol] = [];
      }
      alertsBySymbol[alert.symbol].push(alert);
    });
    
    const triggeredAlerts: Alert[] = [];
    
    // Check each symbol's current price against its alerts
    for (const symbol in alertsBySymbol) {
      try {
        // Fetch current price from Yahoo Finance API
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?region=BR&interval=1d&range=1d`
        );
        
        if (!response.ok) {
          console.error(`Error fetching data for ${symbol}: ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        
        if (!data || data.chart.error) {
          console.error(`Error in data for ${symbol}:`, data?.chart?.error);
          continue;
        }
        
        const result = data.chart.result[0];
        if (!result || !result.meta) {
          console.error(`Incomplete data structure for ${symbol}`);
          continue;
        }
        
        // Get the current price
        const currentPrice = result.meta.regularMarketPrice;
        
        // Check each alert for this symbol
        for (const alert of alertsBySymbol[symbol]) {
          // Update last_checked_at timestamp
          await db.prepare(
            "UPDATE Alerts SET last_checked_at = CURRENT_TIMESTAMP WHERE id = ?"
          ).bind(alert.id).run();
          
          // Check if alert condition is met
          let isTriggered = false;
          
          if (alert.condition === "above" && currentPrice > alert.target_price) {
            isTriggered = true;
          } else if (alert.condition === "below" && currentPrice < alert.target_price) {
            isTriggered = true;
          }
          
          if (isTriggered) {
            // Mark alert as triggered
            await db.prepare(
              "UPDATE Alerts SET triggered_at = CURRENT_TIMESTAMP WHERE id = ?"
            ).bind(alert.id).run();
            
            // Add to triggered alerts list
            triggeredAlerts.push({
              ...alert,
              triggered_at: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error(`Error checking alerts for ${symbol}:`, error);
      }
    }
    
    return triggeredAlerts;
  } catch (error) {
    console.error("Error checking alerts:", error);
    return [];
  }
}

export async function markAlertAsInactive(alertId: number): Promise<void> {
  try {
    const context = getRequestContext();
    const db = context.env.DB;
    
    await db.prepare(
      "UPDATE Alerts SET is_active = false WHERE id = ?"
    ).bind(alertId).run();
    
    console.log("Alert marked as inactive:", alertId);
  } catch (error) {
    console.error("Error marking alert as inactive:", error);
    throw new Error("Failed to update alert.");
  }
}
