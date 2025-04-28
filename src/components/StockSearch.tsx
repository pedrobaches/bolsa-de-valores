'use client'; // Make this a client component for interactivity

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

const StockSearch: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const router = useRouter(); // Initialize router

  const handleSearch = () => {
    if (symbol.trim()) {
      // Navigate to a dynamic route for the stock symbol
      router.push(`/stock/${symbol.trim().toUpperCase()}`);
    } else {
      // Optional: Add some feedback if the input is empty
      console.log("Please enter a stock symbol.");
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="card bg-white dark:bg-zinc-800/50 border-primary-blue">
      <h2 className="text-xl font-semibold mb-3 text-primary-blue dark:text-secondary-blue">Buscar Ação</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Digite o símbolo (ex: PETR4.SA)"
          className="input-field"
          value={symbol}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress} // Add Enter key press handler
        />
        <button
          className="btn-primary"
          onClick={handleSearch}
          disabled={!symbol.trim()} // Disable button if input is empty
        >
          Buscar
        </button>
      </div>
    </div>
  );
};

export default StockSearch;
