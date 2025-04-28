
// This component will display triggered alerts

import React from 'react';
import { markAlertAsInactive } from '@/app/stock/alertActions';

interface Alert {
  id: number;
  symbol: string;
  target_price: number;
  condition: "above" | "below";
  triggered_at: string | null;
}

interface TriggeredAlertsProps {
  alerts: Alert[];
}

const TriggeredAlerts: React.FC<TriggeredAlertsProps> = ({ alerts }) => {
  const [visibleAlerts, setVisibleAlerts] = React.useState(alerts);

  const handleDismiss = async (alertId: number) => {
    try {
      await markAlertAsInactive(alertId);
      // Remove the alert from the visible list
      setVisibleAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error("Failed to dismiss alert:", error);
      // Optionally show an error message to the user
    }
  };

  if (!visibleAlerts || visibleAlerts.length === 0) {
    return null; // Don't render anything if there are no alerts
  }

  return (
    <div className="mb-8 p-4 border rounded-lg shadow-sm bg-yellow-50 dark:bg-yellow-800/30 border-yellow-300 dark:border-yellow-700">
      <h2 className="text-xl font-semibold mb-3 text-yellow-800 dark:text-yellow-200">Alertas Disparados!</h2>
      <ul className="space-y-2">
        {visibleAlerts.map((alert) => (
          <li key={alert.id} className="flex justify-between items-center p-2 border-b border-yellow-200 dark:border-yellow-600 last:border-b-0">
            <div>
              <span className="font-medium">{alert.symbol}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                atingiu R$ {alert.target_price.toFixed(2)} (condição: {alert.condition === 'above' ? 'acima' : 'abaixo'})
              </span>
            </div>
            <button
              onClick={() => handleDismiss(alert.id)}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Dispensar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TriggeredAlerts;

