import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { PortfolioStats } from '../types';

interface StatsCardsProps {
  stats: PortfolioStats;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
};

const formatUsdt = (val: number) => {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const isProfitable = stats.totalRealizedPnl >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Current Balance USDT */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">Balance Actual</h3>
          <Wallet className="text-blue-500 w-5 h-5" />
        </div>
        <div className="text-2xl font-bold text-white">{formatUsdt(stats.currentUsdtBalance)} <span className="text-sm text-gray-500">USDT</span></div>
        <div className="text-xs text-gray-500 mt-2">
          Precio Promedio: {formatCurrency(stats.averageBuyPrice)} / USDT
        </div>
      </div>

      {/* Total Active Investment */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">Inversión Activa</h3>
          <DollarSign className="text-purple-500 w-5 h-5" />
        </div>
        <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalInvestedPesos)}</div>
        <div className="text-xs text-gray-500 mt-2">
          Capital actualmente en USDT
        </div>
      </div>

      {/* Realized PnL */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">Ganancia Realizada</h3>
          {isProfitable ? (
            <TrendingUp className="text-green-500 w-5 h-5" />
          ) : (
            <TrendingDown className="text-red-500 w-5 h-5" />
          )}
        </div>
        <div className={`text-2xl font-bold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
          {isProfitable ? '+' : ''}{formatCurrency(stats.totalRealizedPnl)}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          En operaciones cerradas (Ventas)
        </div>
      </div>
      
       {/* Estimate Value */}
       <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">Valor Estimado (Hoy)</h3>
          <div className="text-yellow-500 font-bold text-xs bg-yellow-900/30 px-2 py-1 rounded">AUTO</div>
        </div>
        {/* Simplified simulation: Assuming current market is roughly avg price + 1% for display demo */}
        <div className="text-2xl font-bold text-gray-200">
             {formatCurrency(stats.currentUsdtBalance * (stats.averageBuyPrice > 0 ? stats.averageBuyPrice : 3900))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Basado en tu precio promedio
        </div>
      </div>
    </div>
  );
};