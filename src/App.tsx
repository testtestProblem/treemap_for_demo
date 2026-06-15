/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, TrendingUp, BarChart3, Clock, Search, RefreshCcw, ArrowUpRight, ArrowDownRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StockTreemap from './components/StockTreemap';
import PortfolioDashboard from './components/PortfolioDashboard';
import { generateSimulationData, getSectorHierarchy, StockData, getStockTier } from './services/stockService';

export default function App() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [visibleTiers, setVisibleTiers] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  // Initialize data
  useEffect(() => {
    refreshData();
    
    // Simulate real-time updates every 10 seconds
    const interval = setInterval(() => {
      updatePrices();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleHome = () => {
    setIsSidebarOpen(false);
    setVisibleTiers([0, 1, 2, 3, 4, 5, 6]);
    setShowDashboard(false);
    setResetCounter(prev => prev + 1);
  };

  const toggleTier = (tier: number) => {
    setVisibleTiers(prev => 
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newData = generateSimulationData();
      setStocks(newData);
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 500);
  };

  const updatePrices = () => {
    setStocks(prev => prev.map(stock => ({
      ...stock,
      changePercent: stock.changePercent + (Math.random() * 0.4 - 0.2),
      price: stock.price + (Math.random() * 2 - 1)
    })));
    setLastUpdate(new Date());
  };

  const hierarchyData = useMemo(() => {
    const filteredStocks = stocks.filter(stock => 
      visibleTiers.includes(getStockTier(stock.changePercent))
    );
    return getSectorHierarchy(filteredStocks);
  }, [stocks, visibleTiers]);

  const marketStats = useMemo(() => {
    if (stocks.length === 0) return { gainers: 0, losers: 0 };
    return {
      gainers: stocks.filter(s => s.changePercent > 0).length,
      losers: stocks.filter(s => s.changePercent <= 0).length,
    };
  }, [stocks]);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Immersive Header */}
      <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-500 hover:text-zinc-300"
              title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <div className="h-4 w-[1px] bg-zinc-800 mx-1" />
            <button 
              onClick={handleHome}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95"
            >
              <div className="bg-emerald-500 p-1.5 rounded">
                <TrendingUp className="w-4 h-4 text-zinc-950" />
              </div>
              <h1 className="text-sm font-black tracking-tighter uppercase">EquityView</h1>
            </button>
          </div>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-4 text-[10px] font-bold">
            <span className="text-emerald-500 uppercase tracking-widest">ADV: {marketStats.gainers}</span>
            <span className="text-rose-500 uppercase tracking-widest">DEC: {marketStats.losers}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-zinc-600">
            <div className="flex items-center gap-2">
              <LegendItem color="#f87171" border="#fca5a5" title="Extreme Loss" active={visibleTiers.includes(0)} onClick={() => toggleTier(0)} label="< -5%" />
              <LegendItem color="#ef4444" border="#f87171" title="Strong Loss" active={visibleTiers.includes(1)} onClick={() => toggleTier(1)} label="-3% to -5%" />
              <LegendItem color="#7f1d1d" border="#991b1b" title="Moderate Loss" active={visibleTiers.includes(2)} onClick={() => toggleTier(2)} label="-1% to -3%" />
              <LegendItem color="#18181b" border="#27272a" title="Neutral" active={visibleTiers.includes(3)} onClick={() => toggleTier(3)} label="-1% to +1%" />
              <LegendItem color="#064e3b" border="#065f46" title="Moderate Gain" active={visibleTiers.includes(4)} onClick={() => toggleTier(4)} label="+1% to +3%" />
              <LegendItem color="#10b981" border="#34d399" title="Strong Gain" active={visibleTiers.includes(5)} onClick={() => toggleTier(5)} label="+3% to +5%" />
              <LegendItem color="#4ade80" border="#6ee7b7" title="Extreme Gain" active={visibleTiers.includes(6)} onClick={() => toggleTier(6)} label="> +5%" />
            </div>
          </div>
          <div className="h-4 w-[1px] bg-zinc-800" />
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              UPD: {lastUpdate.toLocaleTimeString()}
            </span>
            <button 
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-2 hover:bg-zinc-900 rounded-lg transition-colors disabled:opacity-30"
              title="Refresh Market Data"
            >
              <RefreshCcw size={14} className={`${isRefreshing ? 'animate-spin' : 'text-zinc-400'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <motion.aside
          initial={false}
          animate={{ 
            width: isSidebarOpen ? 240 : 0,
            opacity: isSidebarOpen ? 1 : 0
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-zinc-950 border-r border-zinc-900 flex flex-col z-10 overflow-hidden whitespace-nowrap"
        >
          <div className="p-4 space-y-6">
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Market Insights</p>
              <NavItem icon={<LayoutGrid size={16} />} label="Global Treemap" active />
              <NavItem icon={<BarChart3 size={16} />} label="Sector Analysis" />
              <NavItem icon={<TrendingUp size={16} />} label="Momentum" />
              <NavItem icon={<Clock size={16} />} label="Trade History" />
            </div>

            <div className="h-px bg-zinc-900" />

            <div className="space-y-4">
              <p className="px-3 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Alerts</p>
              <div className="px-3 space-y-3">
                <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded border border-zinc-800/50">
                  <span className="text-[10px] font-bold text-zinc-400">Volatility Spike</span>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black">HIGH</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded border border-zinc-800/50">
                  <span className="text-[10px] font-bold text-zinc-400">Tech Sector Bullish</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-black">BUY</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-zinc-900">
            <button 
              onClick={() => setShowDashboard(true)}
              className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 rounded text-[11px] font-black uppercase tracking-widest text-zinc-400 transition-colors"
            >
              Manage Portfolio
            </button>
          </div>
        </motion.aside>

        {/* Main Content Visual */}
        <main className="flex-1 relative overflow-hidden bg-black">
          {stocks.length > 0 ? (
            <StockTreemap resetTrigger={resetCounter} data={hierarchyData} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
              <div className="flex flex-col items-center gap-4">
                <RefreshCcw className="animate-spin text-zinc-700 w-8 h-8" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Calibrating Market Flows</span>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showDashboard && (
              <PortfolioDashboard onClose={() => setShowDashboard(false)} />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Subtle Legend Footer */}
      <footer className="h-8 border-t border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none">
        <div className="flex gap-4">
          <span>Simulation Mode • No Real Assets</span>
          <span>NASDAQ-100 Real-Time Feed Approximation</span>
        </div>
        <div className="flex gap-4">
          <span className="text-zinc-500">Area: Market Volume</span>
          <span className="text-zinc-500">Color: Price Performance</span>
        </div>
      </footer>
    </div>
  );
}

function LegendItem({ color, border, title, active, onClick, label }: { color: string, border: string, title: string, active: boolean, onClick: () => void, label: string }) {
  return (
    <div className="flex items-center gap-1.5 group">
      <button
        onClick={onClick}
        className={`w-3 h-3 rounded-sm transition-all cursor-pointer border hover:scale-110 active:scale-95 ${active ? 'opacity-100 grayscale-0 scale-100 shadow-[0_0_8px_rgba(0,0,0,0.5)]' : 'opacity-20 grayscale scale-90 border-zinc-800'}`}
        style={{
          backgroundColor: color,
          borderColor: active ? border : 'transparent'
        }}
      />
      <span className={`text-[8px] font-bold tracking-tight transition-all hidden lg:block ${active ? 'text-zinc-400' : 'text-zinc-800'}`}>{label}</span>
      {/* Tooltip-like behavior handled by title if preferred, or just the label */}
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all ${active ? 'bg-zinc-900 text-white font-bold border border-zinc-800 shadow-xl' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
      <span className={active ? 'text-emerald-500' : ''}>{icon}</span>
      <span className="hidden md:block text-[11px] font-bold tracking-wider">{label}</span>
    </button>
  );
}

function StatCard({ label, value, subtitle, icon }: { label: string, value: string, subtitle: string, icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-zinc-900 p-5 rounded border border-zinc-800 flex items-start justify-between group cursor-default transition-all hover:border-zinc-700"
    >
      <div>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">{label}</p>
        <h3 className="text-2xl font-bold tracking-tighter mb-1 text-white">{value}</h3>
        <p className="text-[10px] text-zinc-500 font-medium">{subtitle}</p>
      </div>
      <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded group-hover:border-zinc-700 transition-colors">
        {icon}
      </div>
    </motion.div>
  );
}
