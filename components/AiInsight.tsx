import React, { useState } from 'react';
import { Bot, Loader2, Sparkles, X } from 'lucide-react';
import { Transaction } from '../types';
import { analyzePortfolio } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AiInsightProps {
  transactions: Transaction[];
}

export const AiInsight: React.FC<AiInsightProps> = ({ transactions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    const result = await analyzePortfolio(transactions);
    setAnalysis(result);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full p-4 shadow-xl flex items-center gap-2 transition-all hover:scale-105 z-50"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-semibold">Analizar con IA</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-900/50 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Análisis Financiero Inteligente</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-gray-300">
          {!analysis && !loading && (
            <div className="text-center py-8">
              <p className="mb-4">
                Utiliza el poder de Gemini para analizar tus movimientos de compra y venta. 
                Obtén un resumen de rentabilidad y consejos.
              </p>
              <button
                onClick={handleAnalyze}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Generar Reporte
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-400 animate-pulse">Analizando tus transacciones...</p>
            </div>
          )}

          {analysis && (
            <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}
        </div>
        
        {analysis && (
           <div className="p-4 border-t border-gray-800 flex justify-end">
             <button
                onClick={handleAnalyze}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                Regenerar análisis
              </button>
           </div>
        )}
      </div>
    </div>
  );
};