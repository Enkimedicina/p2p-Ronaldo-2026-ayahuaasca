import React, { useState, useEffect } from 'react';
import { PlusCircle, Calculator, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { TransactionType } from '../types';

interface TransactionFormProps {
  onAddTransaction: (
    type: TransactionType,
    amountPesos: number,
    pricePerUsdt: number,
    date: string
  ) => void;
  currentUsdtBalance: number;
  averageBuyPrice: number;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, currentUsdtBalance, averageBuyPrice }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.BUY);
  const [amountPesos, setAmountPesos] = useState<string>('');
  const [pricePerUsdt, setPricePerUsdt] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Calculated preview
  const [calculatedUsdt, setCalculatedUsdt] = useState<number>(0);

  // Profit Preview for Sells
  const [projectedPnL, setProjectedPnL] = useState<number | null>(null);

  useEffect(() => {
    const pesos = parseFloat(amountPesos);
    const price = parseFloat(pricePerUsdt);
    if (!isNaN(pesos) && !isNaN(price) && price > 0) {
      const usdt = pesos / price;
      setCalculatedUsdt(usdt);

      if (type === TransactionType.SELL && averageBuyPrice > 0) {
        const costBasis = usdt * averageBuyPrice;
        const pnl = pesos - costBasis;
        setProjectedPnL(pnl);
      } else {
        setProjectedPnL(null);
      }

    } else {
      setCalculatedUsdt(0);
      setProjectedPnL(null);
    }
  }, [amountPesos, pricePerUsdt, type, averageBuyPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedUsdt <= 0) return;

    // Validation for selling
    if (type === TransactionType.SELL && calculatedUsdt > currentUsdtBalance + 0.01) { // small epsilon for float precision
      alert("No tienes suficientes USDT para realizar esta venta.");
      return;
    }

    onAddTransaction(type, parseFloat(amountPesos), parseFloat(pricePerUsdt), date);
    
    // Reset form
    setAmountPesos('');
    setPricePerUsdt('');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(val);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-blue-500" />
        Registrar Operación
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        
        {/* Type Selector */}
        <div className="md:col-span-12 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-400 mb-2">Tipo</label>
          <div className="flex bg-gray-950 rounded-lg p-1 border border-gray-800">
            <button
              type="button"
              onClick={() => setType(TransactionType.BUY)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                type === TransactionType.BUY 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Compra
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.SELL)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                type === TransactionType.SELL 
                  ? 'bg-green-600 text-white shadow' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Venta
            </button>
          </div>
        </div>

        {/* Date */}
        <div className="md:col-span-6 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-400 mb-2">Fecha</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Total Pesos */}
        <div className="md:col-span-6 lg:col-span-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            {type === TransactionType.BUY ? 'Monto Inversión (MXN)' : 'Monto Recibido (MXN)'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="any"
              required
              placeholder="Ej: 30800000"
              value={amountPesos}
              onChange={(e) => setAmountPesos(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg pl-7 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Price per USDT */}
        <div className="md:col-span-6 lg:col-span-5">
          <label className="block text-sm font-medium text-gray-400 mb-2">Precio / USDT</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="Ej: 19.50"
              value={pricePerUsdt}
              onChange={(e) => setPricePerUsdt(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg pl-7 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Calculation Preview */}
        <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-center pb-2">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Calculator className="w-3 h-3" />
            {type === TransactionType.BUY ? 'Recibirás' : 'Venderás'}:
          </div>
          <div className="text-lg font-mono font-bold text-blue-400">
            {calculatedUsdt > 0 ? calculatedUsdt.toLocaleString('en-US', {maximumFractionDigits: 2}) : '0.00'} 
            <span className="text-xs text-gray-500 ml-1">USDT</span>
          </div>
        </div>
        
        {/* Sell Analysis Panel */}
        {type === TransactionType.SELL && projectedPnL !== null && (
          <div className="md:col-span-12 bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-2">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Resumen de Venta (Estimado)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
               <div>
                  <div className="text-gray-500 text-xs">Precio Compra Promedio</div>
                  <div className="text-gray-300 font-mono">{formatCurrency(averageBuyPrice)}</div>
               </div>
               <div>
                  <div className="text-gray-500 text-xs">Precio Venta Actual</div>
                  <div className={`${parseFloat(pricePerUsdt) >= averageBuyPrice ? 'text-green-400' : 'text-red-400'} font-mono`}>
                    {formatCurrency(parseFloat(pricePerUsdt))}
                  </div>
               </div>
               <div className="col-span-2 md:col-span-1 mt-2 md:mt-0">
                  <div className="text-gray-500 text-xs">Ganancia/Pérdida</div>
                  <div className={`text-lg font-bold flex items-center gap-1 ${projectedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {projectedPnL >= 0 ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                    {formatCurrency(projectedPnL)}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="md:col-span-12 lg:col-span-2">
          <button
            type="submit"
            className={`w-full h-[42px] flex items-center justify-center rounded-lg text-white font-medium shadow-lg transition-transform active:scale-95 ${
              type === TransactionType.BUY ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};