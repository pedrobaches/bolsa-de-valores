-- Define the Alerts table
CREATE TABLE IF NOT EXISTS Alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,            -- Stock symbol (e.g., PETR4.SA)
    target_price REAL NOT NULL,       -- Target price for the alert
    condition TEXT NOT NULL,         -- Condition ("above" or "below")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_checked_at TIMESTAMP NULL, -- When the alert was last checked against market data
    triggered_at TIMESTAMP NULL,    -- When the alert condition was met
    is_active BOOLEAN DEFAULT TRUE   -- Whether the alert is currently active
);

-- Optional: Add an index for faster querying by symbol
CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON Alerts (symbol);

