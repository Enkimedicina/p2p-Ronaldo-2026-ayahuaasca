export enum TransactionType {
  BUY = 'COMPRA',
  SELL = 'VENTA'
}

export interface Transaction {
  id: string;
  portfolioId?: string; // 'main' or 'trading'
  date: string;
  type: TransactionType;
  amountPesos: number;     // Total Pesos involved
  pricePerUsdt: number;    // Exchange rate
  amountUsdt: number;      // Calculated USDT
  
  // Specific for Sales
  realizedPnl?: number;    // Profit/Loss in Pesos
  pnlPercentage?: number;  // Profit/Loss %
}

export interface PortfolioStats {
  totalInvestedPesos: number; // Current active investment (basis)
  currentUsdtBalance: number;
  averageBuyPrice: number;
  totalRealizedPnl: number;
}