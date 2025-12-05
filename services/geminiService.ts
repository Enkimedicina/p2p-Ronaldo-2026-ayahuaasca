import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzePortfolio = async (transactions: Transaction[]): Promise<string> => {
  if (!transactions || transactions.length === 0) {
    return "No hay transacciones suficientes para realizar un análisis.";
  }

  // Format data for the AI to understand clearly
  const historyString = JSON.stringify(transactions.map(t => ({
    fecha: t.date,
    tipo: t.type,
    pesos: t.amountPesos,
    precio_dolar: t.pricePerUsdt,
    usdt: t.amountUsdt,
    ganancia: t.realizedPnl ? `${t.realizedPnl} COP` : 'N/A'
  })));

  const prompt = `
    Actúa como un asesor financiero experto en criptomonedas.
    Analiza el siguiente historial de transacciones de compra/venta de USDT contra Pesos Colombianos (COP).
    
    Datos:
    ${historyString}
    
    Por favor provee:
    1. Un resumen breve del rendimiento.
    2. Identifica si la estrategia ha sido rentable basada en las ventas realizadas.
    3. Una recomendación corta basada en los precios de compra vs venta.
    
    Mantén la respuesta concisa, profesional y en formato Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ocurrió un error al contactar al asistente inteligente. Verifica tu conexión o intenta más tarde.";
  }
};