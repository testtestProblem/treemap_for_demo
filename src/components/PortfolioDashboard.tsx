import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, BarChart3, Target, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioDashboardProps {
  onClose: () => void;
}

type TimeRange = '1Y' | 'YTD' | '3M' | '1M';

// Optimized simulation data generation
const generateSimulationData = (range: TimeRange) => {
  const points: { label: string; portfolio: number; qqq: number }[] = [];
  
  if (range === '1Y') {
    const months = ['Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26'];
    let pVal = -2.5;
    let qVal = -1.8;
    months.forEach(m => {
      pVal += Math.random() * 3 - 0.5;
      qVal += Math.random() * 2 - 0.5;
      points.push({ label: m, portfolio: Number(pVal.toFixed(1)), qqq: Number(qVal.toFixed(1)) });
    });
  } else if (range === 'YTD') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    let pVal = 2.1;
    let qVal = 1.5;
    months.forEach(m => {
      points.push({ label: m, portfolio: Number(pVal.toFixed(1)), qqq: Number(qVal.toFixed(1)) });
      pVal += Math.random() * 3 + 0.2;
      qVal += Math.random() * 2 + 0.1;
    });
  } else if (range === '3M') {
    // 12 weeks
    for (let i = 12; i >= 0; i--) {
      points.push({ 
        label: `W-${i}`, 
        portfolio: Number((12 + (12-i) * 0.8 + Math.random()).toFixed(1)), 
        qqq: Number((8 + (12-i) * 0.5 + Math.random()).toFixed(1)) 
      });
    }
  } else {
    // 1M - 30 days
    for (let i = 30; i >= 0; i -= 2) {
      points.push({ 
        label: `D-${i}`, 
        portfolio: Number((16 + (30-i) * 0.1 + Math.random() * 0.5).toFixed(1)), 
        qqq: Number((11 + (30-i) * 0.05 + Math.random() * 0.3).toFixed(1)) 
      });
    }
  }
  
  // Re-base 3M and 1M to start at 0 for growth comparison if needed, 
  // but let's keep absolute cumulative for consistency with the design "Cumulative Growth Trend"
  return points;
};

export default function PortfolioDashboard({ onClose }: PortfolioDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('YTD');

  const currentData = useMemo(() => generateSimulationData(timeRange), [timeRange]);

  const stats = useMemo(() => {
    const last = currentData[currentData.length - 1];
    const first = currentData[0];
    const portfolioGain = last.portfolio - first.portfolio;
    const qqqGain = last.qqq - first.qqq;
    return {
      portfolio: portfolioGain,
      qqq: qqqGain,
      alpha: portfolioGain - qqqGain
    };
  }, [currentData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      className="absolute inset-0 z-50 bg-zinc-950 flex flex-col p-8"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
              <TrendingUp className="text-emerald-500" />
              Strategic Alpha Dashboard
            </h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Performance Analytics • FY 2026 Simulation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-zinc-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            label={`Portfolio ${timeRange}`}
            value={stats.portfolio}
            icon={<BarChart3 className="text-emerald-500" size={18} />}
          />
          <StatCard
            label={`QQQ ${timeRange}`}
            value={stats.qqq}
            icon={<Target className="text-blue-500" size={18} />}
          />
          <StatCard
            label="Relative Alpha"
            value={stats.alpha}
            icon={<ArrowUpRight className="text-amber-500" size={18} />}
            highlight
          />
        </div>

        {/* Chart View Container */}
        <div className="flex-1 min-h-[400px] bg-zinc-900/30 border border-zinc-900 rounded-2xl p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">
                Performance Trend Comparison (%)
              </h3>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-400">My Portfolio</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-400">QQQ Benchmark</span>
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              {(['1M', '3M', 'YTD', '1Y'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-black font-mono transition-all uppercase tracking-tighter ${
                    timeRange === range 
                      ? 'bg-emerald-500 text-zinc-950 shadow-lg' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartGrid vertical={false} stroke="#1f1f23" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-sans)' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#09090b', 
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                  itemStyle={{ padding: '2px 0' }}
                  labelStyle={{ color: '#71717a', marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#10b981' }}
                  animationDuration={1000}
                />
                <Line 
                  type="monotone" 
                  dataKey="qqq" 
                  stroke="#3f3f46" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0, fill: '#3f3f46' }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon, highlight = false }: { label: string, value: number, icon: React.ReactNode, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-900/40 border-zinc-900'} flex flex-col gap-4 group transition-all hover:border-zinc-800`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">{label}</span>
        {icon}
      </div>
      <div className="flex items-end gap-3 font-mono overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex items-end gap-1"
          >
            <span className="text-4xl font-bold leading-none tracking-tighter">
              {value > 0 ? '+' : ''}{value.toFixed(2)}
              <span className="text-lg text-zinc-600 ml-1">%</span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const CartGrid = ({ vertical, stroke }: { vertical: boolean, stroke: string }) => (
  <CartesianGrid vertical={vertical} stroke={stroke} strokeDasharray="3 3" />
);

