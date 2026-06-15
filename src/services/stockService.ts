/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  volume: number;
  changePercent: number;
  price: number;
}

const SECTORS = {
  Technology: [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'META', name: 'Meta' },
    { symbol: 'ADBE', name: 'Adobe' },
  ],
  Healthcare: [
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'UNH', name: 'UnitedHealth' },
    { symbol: 'PFE', name: 'Pfizer' },
    { symbol: 'ABBV', name: 'AbbVie' },
    { symbol: 'LLY', name: 'Eli Lilly' },
  ],
  Finance: [
    { symbol: 'JPM', name: 'JPMorgan Chase' },
    { symbol: 'BAC', name: 'Bank of America' },
    { symbol: 'V', name: 'Visa' },
    { symbol: 'MA', name: 'Mastercard' },
    { symbol: 'GS', name: 'Goldman Sachs' },
  ],
  Consumer: [
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'WMT', name: 'Walmart' },
    { symbol: 'HD', name: 'Home Depot' },
    { symbol: 'KO', name: 'Coca-Cola' },
  ],
  Energy: [
    { symbol: 'XOM', name: 'Exxon Mobil' },
    { symbol: 'CVX', name: 'Chevron' },
    { symbol: 'SHEL', name: 'Shell' },
  ],
};

export const generateSimulationData = (): StockData[] => {
  const data: StockData[] = [];

  Object.entries(SECTORS).forEach(([sector, stocks]) => {
    stocks.forEach((stock) => {
      data.push({
        ...stock,
        sector,
        // Base volume roughly correlated to company size
        volume: Math.floor(Math.random() * 50000000) + 10000000,
        // Random change between -5% and +5%
        changePercent: (Math.random() * 10 - 5),
        price: Math.floor(Math.random() * 500) + 10,
      });
    });
  });

  return data;
};

export const getStockTier = (change: number): number => {
  if (change > 5) return 6;
  if (change > 3) return 5;
  if (change > 1) return 4;
  if (change >= -1) return 3;
  if (change >= -3) return 2;
  if (change >= -5) return 1;
  return 0;
};

export const getSectorHierarchy = (stocks: StockData[]) => {
  const children = Object.entries(
    stocks.reduce((acc, stock) => {
      if (!acc[stock.sector]) acc[stock.sector] = [];
      acc[stock.sector].push({
        ...stock,
        value: stock.volume, // D3 uses 'value' for sizing
      });
      return acc;
    }, {} as Record<string, any[]>)
  ).map(([name, children]) => ({
    name,
    children,
  }));

  return {
    name: 'Market',
    children,
  };
};
