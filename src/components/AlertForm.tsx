'use client';

import React, { useState } from 'react';
import { createAlert } from '../app/stock/alertActions';

interface AlertFormProps {
  symbol: string;
  currentPrice?: number;
}

const AlertForm: React.FC<AlertFormProps> = ({ symbol, currentPrice }) => {
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetPrice || isNaN(parseFloat(targetPrice))) {
      setMessage({ text: 'Por favor, insira um preço válido.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await createAlert({
        symbol,
        targetPrice: parseFloat(targetPrice),
        condition
      });
      
      setMessage({ text: 'Alerta criado com sucesso!', type: 'success' });
      setTargetPrice('');
    } catch (error) {
      setMessage({ text: 'Erro ao criar alerta. Tente novamente.', type: 'error' });
      console.error('Error creating alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card border-primary-green">
      <h2 className="text-xl font-semibold mb-4 text-primary-green dark:text-secondary-green">Criar Alerta de Preço</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Condição
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-primary-blue"
                name="condition"
                value="above"
                checked={condition === 'above'}
                onChange={() => setCondition('above')}
              />
              <span className="ml-2">Acima de</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-primary-green"
                name="condition"
                value="below"
                checked={condition === 'below'}
                onChange={() => setCondition('below')}
              />
              <span className="ml-2">Abaixo de</span>
            </label>
          </div>
        </div>
        
        <div>
          <label htmlFor="targetPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preço Alvo (R$)
          </label>
          <input
            type="number"
            id="targetPrice"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            step="0.01"
            min="0"
            placeholder={currentPrice ? currentPrice.toString() : "0.00"}
            className="input-field"
            required
          />
          {currentPrice && (
            <p className="text-xs text-gray-500 mt-1">
              Preço atual: R$ {currentPrice.toFixed(2)}
            </p>
          )}
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-secondary w-full"
          >
            {isSubmitting ? 'Criando...' : 'Criar Alerta'}
          </button>
        </div>
        
        {message && (
          <div className={`p-3 rounded ${message.type === 'success' ? 'bg-light-green text-primary-green dark:bg-green-800/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default AlertForm;
