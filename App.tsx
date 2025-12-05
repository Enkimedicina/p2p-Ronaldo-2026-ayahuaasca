import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LayoutDashboard, Plus, X, Calculator, Briefcase, Zap } from 'lucide-react';
import { Transaction, TransactionType, PortfolioStats } from './types';
import { StatsCards } from './components/StatsCards';
import { TransactionForm } from './components/TransactionForm';
import { HistoryTable } from './components/HistoryTable';
import { AiInsight } from './components/AiInsight';
import { SimulationModal } from './components/SimulationModal';

const PORTFOLIOS = [
  { 
    id: 'main', 
    label: 'Inversión Principal', 
    icon: Briefcase, 
    theme: {
      primary: 'bg-blue-600',
      hover: 'hover:bg-blue-500',
      text: 'text-blue-400',
      lightBg: 'bg-blue-900/20',
      border: 'border-blue-900/50',
      shadow: 'shadow-blue-900/20'
    }
  },
  { 
    id: 'trading', 
    label: 'Trading / Scalping', 
    icon: Zap, 
    theme: {
      primary: 'bg-purple-600',
      hover: 'hover:bg-purple-500',
      text: 'text-purple-400',
      lightBg: 'bg-purple-900/20',
      border: 'border-purple-900/50',
      shadow: 'shadow-purple-900/20'
    }
  },
];

function App() {
  const [activePortfolio, setActivePortfolio] = useState<string>(() => {
    return localStorage.getItem('active_portfolio') || 'main';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('usdt_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure compatibility with older data that might lack IDs or portfolioId
        return parsed.map((t: any) => ({
          ...t,
          id: t.id || uuidv4(),
          portfolioId: t.portfolioId || 'main' // Default legacy data to main portfolio
        }));
      } catch (e) {
        console.error("Error loading transactions", e);
        return [];
      }
    }
    return [];
  });

  const [stats, setStats] = useState<PortfolioStats>({
    totalInvestedPesos: 0,
    currentUsdtBalance: 0,
    averageBuyPrice: 0,
    totalRealizedPnl: 0,
  });

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);

  // Filter transactions based on active portfolio
  const filteredTransactions = transactions.filter(t => (t.portfolioId || 'main') === activePortfolio);
  const activePortfolioConfig = PORTFOLIOS.find(p => p.id === activePortfolio) || PORTFOLIOS[0];

  // Persist active portfolio selection
  useEffect(() => {
    localStorage.setItem('active_portfolio', activePortfolio);
  }, [activePortfolio]);

  // Calculate Portfolio Stats whenever transactions or activePortfolio change
  useEffect(() => {
    localStorage.setItem('usdt_transactions', JSON.stringify(transactions));

    let totalInvested = 0; // Total active pesos invested
    let totalUsdt = 0; // Current USDT balance
    let realizedPnl = 0; // Closed profit/loss
    
    // To calculate Weighted Average Buy Price (WABP)
    let sumProductBuy = 0;
    let sumUsdtBuy = 0;

    // Use filtered transactions for stats calculation
    filteredTransactions.forEach(t => {
      if (t.type === TransactionType.BUY) {
        sumProductBuy += t.amountPesos;
        sumUsdtBuy += t.amountUsdt;
        
        totalInvested += t.amountPesos;
        totalUsdt += t.amountUsdt;
      } else if (t.type === TransactionType.SELL) {
        totalUsdt -= t.amountUsdt;
        
        if (t.realizedPnl) {
            realizedPnl += t.realizedPnl;
        }
      }
    });

    const currentAvgBuyPrice = sumUsdtBuy > 0 ? sumProductBuy / sumUsdtBuy : 0;
    const currentActiveInvestment = totalUsdt * currentAvgBuyPrice;

    setStats({
      totalInvestedPesos: currentActiveInvestment,
      currentUsdtBalance: Math.max(0, totalUsdt),
      averageBuyPrice: currentAvgBuyPrice,
      totalRealizedPnl: realizedPnl
    });

  }, [transactions, activePortfolio]); // Recalculate when transactions change OR tab changes

  const handleAddTransaction = (type: TransactionType, amountPesos: number, pricePerUsdt: number, date: string) => {
    const amountUsdt = amountPesos / pricePerUsdt;
    
    let newTx: Transaction = {
      id: uuidv4(),
      portfolioId: activePortfolio, // Tag transaction with current tab
      date,
      type,
      amountPesos,
      pricePerUsdt,
      amountUsdt,
    };

    if (type === TransactionType.SELL) {
      // Calculate PnL Logic based ONLY on this portfolio's history
      // We re-filter here to ensure we calculate against the correct average
      const portfolioBuys = transactions.filter(t => (t.portfolioId || 'main') === activePortfolio && t.type === TransactionType.BUY);
      
      const totalBuyPesos = portfolioBuys.reduce((sum, t) => sum + t.amountPesos, 0);
      const totalBuyUsdt = portfolioBuys.reduce((sum, t) => sum + t.amountUsdt, 0);
      
      const weightedAvgPrice = totalBuyUsdt > 0 ? totalBuyPesos / totalBuyUsdt : 0;
      
      const costBasis = amountUsdt * weightedAvgPrice;
      const pnl = amountPesos - costBasis;
      const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      newTx = {
        ...newTx,
        realizedPnl: pnl,
        pnlPercentage: pnlPercent
      };
    }

    const updated = [...transactions, newTx].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setTransactions(updated);
    setIsTransactionModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro? Esto afectará los cálculos.')) {
      setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-gray-800 pb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Dynamic Header Icon based on Portfolio */}
            <div className={`${activePortfolioConfig.theme.primary} p-2 rounded-lg transition-colors duration-300`}>
              <activePortfolioConfig.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">USDT Trader Pro</h1>
              <p className="text-gray-400 text-sm">Gestión de Inversiones y PnL</p>
            </div>
          </div>
        </header>

        {/* Portfolio Tabs */}
        <div className="mb-6 flex space-x-2 bg-gray-900/50 p-1.5 rounded-xl w-full max-w-md border border-gray-800">
          {PORTFOLIOS.map((portfolio) => {
            const Icon = portfolio.icon;
            const isActive = activePortfolio === portfolio.id;
            return (
              <button
                key={portfolio.id}
                onClick={() => setActivePortfolio(portfolio.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-800 text-white shadow-md border border-gray-700'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? portfolio.theme.text : ''}`} />
                {portfolio.label}
              </button>
            );
          })}
        </div>

        <div className="mb-2">
          <h2 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-3">
             Resumen: {activePortfolioConfig.label}
          </h2>
          <StatsCards stats={stats} />
        </div>
        
        {/* Toolbar with New Operation Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-t border-gray-800 pt-6">
           <div>
             <h2 className="text-xl font-bold text-white">Mis Operaciones</h2>
             <p className="text-xs text-gray-500">
               Mostrando historial de: <span className="text-gray-300">{activePortfolioConfig.label}</span>
             </p>
           </div>
           
           <div className="flex gap-3 w-full sm:w-auto">
             <button 
               onClick={() => setIsSimulationModalOpen(true)}
               className="flex-1 sm:flex-none bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 font-medium"
             >
               <Calculator className="w-5 h-5 text-gray-400" />
               <span>Simular Venta</span>
             </button>

             {/* Dynamic Color Action Button */}
             <button 
               onClick={() => setIsTransactionModalOpen(true)}
               className={`flex-1 sm:flex-none ${activePortfolioConfig.theme.primary} ${activePortfolioConfig.theme.hover} text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg ${activePortfolioConfig.theme.shadow} transition-all hover:scale-105 active:scale-95 font-medium`}
             >
               <Plus className="w-5 h-5" />
               <span>Nueva Operación</span>
             </button>
           </div>
        </div>
        
        {/* Main Content: Full Width Table */}
        <div className="mb-8">
            <HistoryTable 
              transactions={filteredTransactions} 
              onDelete={handleDelete} 
              title={`Historial: ${activePortfolioConfig.label}`}
            />
        </div>
      </div>
      
      {/* AI analyzes ONLY current view with CONTEXT */}
      <AiInsight 
        transactions={filteredTransactions} 
        portfolioName={activePortfolioConfig.label}
      />

      {/* MODAL: Register Operation */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-end p-4 absolute right-0 top-0 z-10">
              <button 
                onClick={() => setIsTransactionModalOpen(false)}
                className="text-gray-400 hover:text-white bg-gray-900/50 rounded-full p-1 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
               {/* Dynamic Modal Banner */}
               <div className={`mb-4 ${activePortfolioConfig.theme.lightBg} border ${activePortfolioConfig.theme.border} p-3 rounded-lg flex items-center gap-2`}>
                 <activePortfolioConfig.icon className={`w-4 h-4 ${activePortfolioConfig.theme.text}`} />
                 <span className={`text-sm ${activePortfolioConfig.theme.text.replace('400', '200')}`}>
                   Registrando en: <strong>{activePortfolioConfig.label}</strong>
                 </span>
               </div>

               <TransactionForm 
                  onAddTransaction={handleAddTransaction} 
                  currentUsdtBalance={stats.currentUsdtBalance}
                  averageBuyPrice={stats.averageBuyPrice}
               />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Simulation */}
      {isSimulationModalOpen && (
        <SimulationModal 
          onClose={() => setIsSimulationModalOpen(false)}
          currentUsdtBalance={stats.currentUsdtBalance}
          averageBuyPrice={stats.averageBuyPrice}
        />
      )}
    </div>
  );
}

export default App;