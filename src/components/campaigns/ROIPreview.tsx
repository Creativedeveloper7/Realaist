import React, { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Eye, MousePointerClick, Heart, BarChart3 } from 'lucide-react';
import { calculateROI, generateROIProjection, formatLargeNumber, ROIMetrics } from '../../utils/roiCalculator';
import { formatKES, formatKESNumber, MIN_CAMPAIGN_BUDGET } from '../../utils/currency';
import { useTheme } from '../../ThemeContext';

interface ROIPreviewProps {
  budget: number | string;
  platforms: string[];
  onBudgetChange: (budget: number) => void;
}

const MAX_BUDGET = 500000; // KES 500,000 maximum
const MIN_BUDGET = MIN_CAMPAIGN_BUDGET; // KES 1,000 minimum

export const ROIPreview: React.FC<ROIPreviewProps> = ({
  budget,
  platforms,
  onBudgetChange,
}) => {
  const { isDarkMode } = useTheme();
  const [hoveredBudget, setHoveredBudget] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stableRange, setStableRange] = useState<{ min: number; max: number } | null>(null);

  // Convert budget to number, defaulting to median if empty
  const budgetNumber = useMemo(() => {
    const MEDIAN_BUDGET = 50000;
    const num = typeof budget === 'string' ? parseFloat(budget) || 0 : budget;
    // If budget is empty or 0, default to median
    const value = num || MEDIAN_BUDGET;
    return Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, value));
  }, [budget]);

  // Normalize platform names and default to Google Ads if none selected
  const normalizedPlatforms = useMemo(() => {
    if (platforms.length === 0) {
      return ['Google Ads']; // Default to Google Ads
    }
    // Map form platform names to ROI calculator names
    return platforms.map((platform: string) => {
      if (platform === 'google') return 'Google Ads';
      if (platform === 'meta') return 'Meta Ads';
      return platform; // Fallback for any other format
    });
  }, [platforms]);

  // Calculate current ROI metrics
  const currentMetrics = useMemo(() => {
    if (!budgetNumber) {
      return {
        impressions: 0,
        views: 0,
        clicks: 0,
        engagement: 0,
      };
    }
    return calculateROI(budgetNumber, normalizedPlatforms);
  }, [budgetNumber, normalizedPlatforms]);

  // Generate projection data for graph
  const projectionData = useMemo(() => {
    return generateROIProjection(MIN_BUDGET, MAX_BUDGET, normalizedPlatforms, 30);
  }, [normalizedPlatforms]);

  // Handle slider change - snap to nearest step
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // The slider value is already snapped by the step attribute, so we can use it directly
    onBudgetChange(value);
  }, [onBudgetChange]);

  // Handle budget input change
  const handleBudgetInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    const clampedValue = Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, value));
    onBudgetChange(clampedValue);
  }, [onBudgetChange]);

  // Calculate dynamic slider range based on current budget (similar to X-axis domain)
  const MEDIAN_BUDGET_SLIDER = 50000;
  const calculatedRange = useMemo(() => {
    const distanceFromMedian = Math.abs(budgetNumber - MEDIAN_BUDGET_SLIDER);
    const normalizedDistance = distanceFromMedian / MEDIAN_BUDGET_SLIDER;
    
    // Base range multiplier: starts at 2x median and grows with distance
    const baseRange = MEDIAN_BUDGET_SLIDER * 2; // 100K base range
    const dynamicRange = baseRange * (1 + normalizedDistance * 0.5);
    
    let range;
    if (budgetNumber <= MEDIAN_BUDGET_SLIDER) {
      // For budgets at or below median, center around median
      const lowerBound = Math.max(MIN_BUDGET, MEDIAN_BUDGET_SLIDER - dynamicRange / 2);
      const upperBound = Math.min(MAX_BUDGET, MEDIAN_BUDGET_SLIDER + dynamicRange / 2);
      range = { min: lowerBound, max: upperBound };
    } else {
      // For budgets above median, expand upward but keep median visible
      const lowerBound = MIN_BUDGET;
      const minUpperBound = budgetNumber * 1.15;
      const upperBound = Math.min(MAX_BUDGET, Math.max(minUpperBound, MEDIAN_BUDGET_SLIDER + dynamicRange));
      range = { min: lowerBound, max: upperBound };
    }
    
    return range;
  }, [budgetNumber]);

  // Use stable range during dragging to prevent slider thumb jumps
  const sliderRange = useMemo(() => {
    if (isDragging && stableRange) {
      console.log('[Slider Range]', {
        budgetNumber,
        usingStableRange: true,
        stableRange,
        calculatedRange,
        rangeDifference: {
          min: calculatedRange.min - stableRange.min,
          max: calculatedRange.max - stableRange.max,
        }
      });
      return stableRange;
    }
    
    console.log('[Slider Range]', {
      budgetNumber,
      usingStableRange: false,
      range: calculatedRange,
      rangeSize: calculatedRange.max - calculatedRange.min,
    });
    
    return calculatedRange;
  }, [budgetNumber, isDragging, stableRange, calculatedRange]);

  // Calculate dynamic step size based on range
  const sliderStep = useMemo(() => {
    const range = sliderRange.max - sliderRange.min;
    // Step size should be approximately 1/200th of the range, rounded to nearest 100 or 500
    const baseStep = range / 200;
    let step;
    if (baseStep < 100) {
      step = 100;
    } else if (baseStep < 500) {
      step = Math.round(baseStep / 100) * 100;
    } else {
      step = Math.round(baseStep / 500) * 500;
    }
    
    console.log('[Slider Step]', {
      range,
      baseStep: baseStep.toFixed(2),
      calculatedStep: step,
      numberOfSteps: Math.round(range / step),
    });
    
    return step;
  }, [sliderRange]);

  // Calculate slider percentage for visual indicator position
  const sliderPercentage = useMemo(() => {
    const range = sliderRange.max - sliderRange.min;
    if (range === 0) return 0;
    const percentage = ((budgetNumber - sliderRange.min) / range) * 100;
    return percentage;
  }, [budgetNumber, sliderRange]);

  // Format graph data with dynamic fill - include both full projection and current budget fill
  const graphData = useMemo(() => {
    const data = projectionData.map((point) => {
      const isWithinBudget = point.budget <= budgetNumber;
      return {
        budget: point.budget,
        impressions: point.impressions, // Full projection
        currentImpressions: isWithinBudget ? point.impressions : null, // Filled area only up to current budget
      };
    });

    // Ensure we include the exact current budget point for smooth transition
    const hasExactBudget = data.some((p) => p.budget === budgetNumber);
    if (!hasExactBudget && budgetNumber >= MIN_BUDGET) {
      const currentMetrics = calculateROI(budgetNumber, normalizedPlatforms);
      // Find insertion point
      const insertIndex = data.findIndex((p) => p.budget > budgetNumber);
      const newPoint = {
        budget: budgetNumber,
        impressions: currentMetrics.impressions,
        currentImpressions: currentMetrics.impressions,
      };
      if (insertIndex === -1) {
        data.push(newPoint);
      } else {
        data.splice(insertIndex, 0, newPoint);
      }
    }
    
    return data;
  }, [projectionData, budgetNumber, normalizedPlatforms]);

  // Calculate dynamic X-axis domain based on current budget
  // Median budget is 50,000 KES - this should be around the middle of the scale
  const MEDIAN_BUDGET = 50000;
  const xAxisDomain = useMemo(() => {
    if (projectionData.length === 0) return [MIN_BUDGET, MAX_BUDGET];
    
    // Calculate the range dynamically - scale grows/shrinks based on distance from median
    // Always try to keep median visible and roughly centered when possible
    
    const distanceFromMedian = Math.abs(budgetNumber - MEDIAN_BUDGET);
    const normalizedDistance = distanceFromMedian / MEDIAN_BUDGET; // 0 to ~9 (for max budget)
    
    // Base range multiplier: starts at 2x median (100K) and grows with distance
    // This ensures median stays roughly in the middle for small budgets
    const baseRange = MEDIAN_BUDGET * 2; // 100K base range
    const dynamicRange = baseRange * (1 + normalizedDistance * 0.5); // Grows up to 1.5x base
    
    if (budgetNumber <= MEDIAN_BUDGET) {
      // For budgets at or below median, try to center around median
      const lowerBound = Math.max(MIN_BUDGET, MEDIAN_BUDGET - dynamicRange / 2);
      const upperBound = Math.min(MAX_BUDGET, MEDIAN_BUDGET + dynamicRange / 2);
      return [lowerBound, upperBound];
    } else {
      // For budgets above median, expand upward but keep median visible
      const lowerBound = MIN_BUDGET;
      // Ensure we show at least up to current budget + margin
      const minUpperBound = budgetNumber * 1.15;
      const upperBound = Math.min(MAX_BUDGET, Math.max(minUpperBound, MEDIAN_BUDGET + dynamicRange));
      return [lowerBound, upperBound];
    }
  }, [budgetNumber, projectionData]);

  // Filter graph data to only show points within the dynamic X-axis domain
  const filteredGraphData = useMemo(() => {
    return graphData.filter((point) => 
      point.budget >= xAxisDomain[0] && point.budget <= xAxisDomain[1]
    );
  }, [graphData, xAxisDomain]);

  // Custom tooltip for graph
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const metrics = calculateROI(data.budget, normalizedPlatforms);
      return (
        <div className={`bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            Budget: {formatKES(data.budget)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Impressions: {formatLargeNumber(metrics.impressions)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Campaign Budget Section */}
      <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl text-[#C7A667]">$</span>
          <label className="text-lg font-semibold text-gray-900 dark:text-white">
            Campaign Budget *
          </label>
          <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Set your total campaign budget
        </p>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">KES</span>
          </div>
          <input
            type="number"
            value={budgetNumber}
            onChange={handleBudgetInputChange}
            min={MIN_BUDGET}
            max={MAX_BUDGET}
            className="w-full pl-16 pr-4 py-3 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#C7A667] focus:border-transparent transition-colors"
            placeholder="0"
          />
        </div>
      </div>

      {/* Expected ROI Preview Section */}
      <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#C7A667]" />
            <label className="text-lg font-semibold text-gray-900 dark:text-white">
              Expected ROI Preview
            </label>
          </div>

           {/* Budget Display and Slider */}
           <div className="mb-6">
             <div className="flex justify-between items-center mb-2">
               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                 Budget: {formatKES(budgetNumber)}
               </span>
               <span className="text-sm text-gray-500 dark:text-gray-400">
                 {formatKES(sliderRange.min)} - {formatKES(sliderRange.max)}
               </span>
             </div>
             <div className="relative">
               <input
                 type="range"
                 min={sliderRange.min}
                 max={sliderRange.max}
                 value={budgetNumber}
                 onChange={handleSliderChange}
                 onMouseDown={() => {
                   // Lock the range when dragging starts
                   setIsDragging(true);
                   setStableRange(calculatedRange);
                 }}
                 onMouseUp={() => {
                   // Release the range when dragging ends
                   setIsDragging(false);
                   setStableRange(null);
                 }}
                 onTouchStart={() => {
                   // Handle touch devices
                   setIsDragging(true);
                   setStableRange(calculatedRange);
                 }}
                 onTouchEnd={() => {
                   setIsDragging(false);
                   setStableRange(null);
                 }}
                 step={sliderStep}
                 className="w-full h-2 bg-gray-200 dark:bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                 style={{
                   background: `linear-gradient(to right, #C7A667 0%, #C7A667 ${sliderPercentage}%, ${isDarkMode ? 'rgba(255,255,255,0.2)' : '#e5e7eb'} ${sliderPercentage}%, ${isDarkMode ? 'rgba(255,255,255,0.2)' : '#e5e7eb'} 100%)`,
                 }}
               />
              <style>{`
                .slider::-webkit-slider-thumb {
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #C7A667;
                  cursor: pointer;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .slider::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #C7A667;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <motion.div
              className="bg-white dark:bg-white/10 rounded-lg p-4 border border-gray-200 dark:border-white/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-[#C7A667]" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Impressions</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatLargeNumber(currentMetrics.impressions)}
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-white/10 rounded-lg p-4 border border-gray-200 dark:border-white/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-[#C7A667]" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Views</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatLargeNumber(currentMetrics.views)}
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-white/10 rounded-lg p-4 border border-gray-200 dark:border-white/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick className="w-4 h-4 text-[#C7A667]" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Clicks</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatLargeNumber(currentMetrics.clicks)}
              </p>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-white/10 rounded-lg p-4 border border-gray-200 dark:border-white/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-[#C7A667]" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Engagement</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatLargeNumber(currentMetrics.engagement)}
              </p>
            </motion.div>
          </div>

           {/* ROI Projection Graph */}
           {filteredGraphData.length > 0 && (
             <div className="mb-4">
               <div className="flex justify-between items-center mb-3">
                 <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                   ROI Projection by Budget
                 </h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                   Drag slider or hover to see details
                 </p>
               </div>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart
                     data={filteredGraphData}
                     onMouseMove={(e: any) => {
                       if (e && e.activePayload && e.activePayload[0]) {
                         setHoveredBudget(e.activePayload[0].payload.budget);
                       }
                     }}
                     onMouseLeave={() => setHoveredBudget(null)}
                   >
                     <defs>
                       <linearGradient id="colorImpressionsFilled" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#C7A667" stopOpacity={0.8}/>
                         <stop offset="95%" stopColor="#C7A667" stopOpacity={0.2}/>
                       </linearGradient>
                       <linearGradient id="colorImpressionsProjected" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#C7A667" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="#C7A667" stopOpacity={0.05}/>
                       </linearGradient>
                     </defs>
                     <XAxis
                       dataKey="budget"
                       domain={xAxisDomain}
                       type="number"
                       stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                       tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 10 }}
                       tickFormatter={(value) => {
                         if (value >= 1000) {
                           return `${(value / 1000).toFixed(0)}K`;
                         }
                         return value.toString();
                       }}
                       angle={-45}
                       textAnchor="end"
                       height={60}
                     />
                    <YAxis
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 10 }}
                      tickFormatter={(value) => formatLargeNumber(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Full projection area (light, for context) */}
                    <Area
                      type="monotone"
                      dataKey="impressions"
                      stroke="#C7A667"
                      strokeWidth={1.5}
                      strokeOpacity={0.3}
                      fill="url(#colorImpressionsProjected)"
                      fillOpacity={1}
                      name="Projected ROI"
                      connectNulls={true}
                    />
                    {/* Dynamic filled area up to current budget (highlighted) */}
                    <Area
                      type="monotone"
                      dataKey="currentImpressions"
                      stroke="#C7A667"
                      strokeWidth={2.5}
                      fill="url(#colorImpressionsFilled)"
                      fillOpacity={1}
                      name="Current ROI"
                      connectNulls={false}
                    />
                    <ReferenceLine
                      x={budgetNumber}
                      stroke="#C7A667"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ value: 'Current Budget', position: 'top', fill: '#C7A667', fontSize: 10 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#C7A667]"></div>
                  <span>Current Budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#C7A667]"></div>
                  <span>Projected ROI</span>
                </div>
              </div>
            </div>
          )}

          {/* Note Section */}
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Note:</span> These are estimated metrics based on industry averages. Actual performance may vary based on ad quality, targeting, and market conditions. Budget shown is after platform fees (30%).
            </p>
          </div>
        </div>
      
    </div>
  );
};

