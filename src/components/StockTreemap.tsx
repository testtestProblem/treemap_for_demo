/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { StockData } from '../services/stockService';

interface TreemapProps {
  data: any;
  onSelect?: (stock: StockData) => void;
  resetTrigger?: number;
}

export default function StockTreemap({ data, onSelect, resetTrigger }: TreemapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredStock, setHoveredStock] = useState<StockData | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create a main container for zoom/pan
    const mainG = svg.append('g').attr('class', 'main-container');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([[0, 0], [dimensions.width, dimensions.height]])
      .extent([[0, 0], [dimensions.width, dimensions.height]])
      .on('zoom', (event) => {
        mainG.attr('transform', event.transform);
        if (event.transform.k > 1.1) {
          svg.style('cursor', 'grabbing');
        } else {
          svg.style('cursor', 'grab');
        }
      });

    svg.call(zoom)
       .style('cursor', 'grab');

    // Reset zoom transform on resetTrigger
    svg.call(zoom.transform, d3.zoomIdentity);

    const root = d3.hierarchy(data)
      .sum(d => (d as any).value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    d3.treemap()
      .size([dimensions.width, dimensions.height])
      .paddingTop(0)
      .paddingInner(1)
      (root);

    // 7-Tier Intensity Mapping:
    const colorScale = d3.scaleLinear<string>()
      .domain([-5, -3, -1, 0, 1, 3, 5])
      .range([
        '#f87171', // Extreme Loss (Bright Coral)
        '#ef4444', // Strong Loss (Vibrant Red)
        '#7f1d1d', // Mod Loss (Deep Maroon)
        '#18181b', // Neutral (Dark Zinc)
        '#064e3b', // Mod Gain (Deep Emerald)
        '#10b981', // Strong Gain (Vibrant Emerald)
        '#4ade80'  // Extreme Gain (Bright Green)
      ]);

    const borderScale = d3.scaleLinear<string>()
      .domain([-5, -3, -1, 0, 1, 3, 5])
      .range([
        '#fca5a5', // Extreme Border
        '#f87171', // Strong Border
        '#991b1b', // Mod Border
        '#27272a', // Neutral Border
        '#065f46', // Mod Border Gain
        '#34d399', // Strong Border Gain
        '#6ee7b7'  // Extreme Border Gain
      ]);

    const nodes = mainG.selectAll('g')
      .data(root.leaves() as d3.HierarchyRectangularNode<any>[])
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    nodes.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale((d.data as any).changePercent))
      .attr('stroke', d => borderScale((d.data as any).changePercent))
      .attr('stroke-width', '1')
      .attr('class', 'transition-all duration-300 hover:brightness-125')
      .on('mouseenter', (event, d) => {
        setHoveredStock(d.data as unknown as StockData);
      })
      .on('mouseleave', () => {
        setHoveredStock(null);
      })
      .on('click', (event, d) => {
        if (onSelect) onSelect(d.data as unknown as StockData);
      })
      .style('cursor', 'pointer');

    // Add Symbol labels
    nodes.append('text')
      .attr('x', 5)
      .attr('y', d => (d.y1 - d.y0) * 0.28 + 2)
      .text(d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        if (width < 25 || height < 25) return '';
        return (d.data as any).symbol;
      })
      .attr('font-size', d => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        return Math.min(w * 0.22, h * 0.25, 32); 
      })
      .attr('fill', '#f4f4f5')
      .attr('font-weight', '700')
      .attr('letter-spacing', '-0.02em')
      .attr('pointer-events', 'none');

    // Add Change % labels
    nodes.append('text')
      .attr('x', 5)
      .attr('y', d => (d.y1 - d.y0) * 0.48 + 2)
      .text(d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        if (width < 40 || height < 45) return '';
        return `${(d.data as any).changePercent > 0 ? '+' : ''}${(d.data as any).changePercent.toFixed(2)}%`;
      })
      .attr('font-size', d => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        return Math.min(w * 0.12, h * 0.15, 14);
      })
      .attr('font-weight', '500')
      .attr('fill', 'rgba(244,244,245,0.7)')
      .attr('pointer-events', 'none');

    // Add Price labels
    nodes.append('text')
      .attr('x', 5)
      .attr('y', d => (d.y1 - d.y0) * 0.68 + 2)
      .text(d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        if (width < 50 || height < 65) return '';
        return `$${(d.data as any).price.toFixed(2)}`;
      })
      .attr('font-size', d => {
        const w = d.x1 - d.x0;
        const h = d.y1 - d.y0;
        return Math.min(w * 0.1, h * 0.12, 12);
      })
      .attr('font-family', 'var(--font-mono)')
      .attr('font-weight', '500')
      .attr('fill', 'rgba(244,244,245,0.5)')
      .attr('pointer-events', 'none');

    // Sector Labels (only if large enough)
    const sectors = mainG.selectAll('.sector-label')
      .data((root.children || []) as d3.HierarchyRectangularNode<any>[])
      .enter()
      .append('text')
      .attr('class', 'sector-label')
      .attr('x', d => d.x0 + 6)
      .attr('y', d => d.y0 + 15)
      .text(d => (d.data as any).name)
      .attr('font-size', '9px')
      .attr('fill', 'rgba(244,244,245,0.3)')
      .attr('font-weight', '800')
      .attr('text-transform', 'uppercase')
      .attr('letter-spacing', '0.1em');

  }, [data, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-zinc-950 rounded-sm border border-zinc-900">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      
      {/* Dynamic Tooltip */}
      <AnimatePresence>
        {hoveredStock && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 pointer-events-none bg-zinc-950 border border-zinc-800 p-4 rounded-lg shadow-2xl backdrop-blur-xl"
            style={{
              left: '50%',
              bottom: '24px',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xl font-bold text-white">{hoveredStock.symbol}</span>
                <span className={`text-sm font-medium ${hoveredStock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {hoveredStock.changePercent >= 0 ? '+' : ''}{hoveredStock.changePercent.toFixed(2)}%
                </span>
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">{hoveredStock.name}</span>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-gray-800 pt-2 text-[10px]">
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase">Price</span>
                  <span className="text-gray-200">${hoveredStock.price.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 uppercase">Volume</span>
                  <span className="text-gray-200">{(hoveredStock.volume / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
