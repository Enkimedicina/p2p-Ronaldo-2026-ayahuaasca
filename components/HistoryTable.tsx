import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Trash2 } from 'lucide-react';

interface HistoryTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ transactions, onDelete }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const formatUsdt = (val: number) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white">Historial de Operaciones</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950 text-gray-400 text-sm uppercase tracking-wider">
              <th className="p-4 border-b border-gray-800">Tipo</th>
              <th className="p-4 border-b border-gray-800">Fecha</th>
              <th className="p-4 border-b border-gray-800 text-right">Cant. USDT</th>
              <th className="p-4 border-b border-gray-800 text-right">Precio (COP)</th>
              <th className="p-4 border-b border-gray-800 text-right">Total (COP)</th>
              <th className="p-4 border-b border-gray-800 text-right">Ganancia/Pérdida</th>
              <th className="p-4 border-b border-gray-800 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No hay operaciones registradas aún.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-800/50 transition-colors text-sm">
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      tx.type === TransactionType.BUY 
                        ? 'bg-blue-900/50 text-blue-400 border border-blue-800' 
                        : 'bg-green-900/50 text-green-400 border border-green-800'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{tx.date}</td>
                  <td className="p-4 text-right font-mono text-gray-300">{formatUsdt(tx.amountUsdt)}</td>
                  <td className="p-4 text-right text-gray-400">{formatCurrency(tx.pricePerUsdt)}</td>
                  <td className="p-4 text-right font-medium text-white">{formatCurrency(tx.amountPesos)}</td>
                  <td className="p-4 text-right">
                    {tx.type === TransactionType.SELL && tx.realizedPnl !== undefined && tx.pnlPercentage !== undefined ? (
                      <div className="flex flex-col items-end">
                        <span className={tx.realizedPnl >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                          {tx.realizedPnl >= 0 ? '+' : ''}{formatCurrency(tx.realizedPnl)}
                        </span>
                        <span className={`text-xs ${tx.realizedPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.realizedPnl >= 0 ? '+' : ''}{tx.pnlPercentage.toFixed(2)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-600 italic">N/A</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(tx.id);
                      }}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};