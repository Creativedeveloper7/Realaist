import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { propertiesService } from '../../services/propertiesService';
import { useAuth } from '../../contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Building2,
  Calendar,
  MapPin,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsPageProps {
  isDarkMode: boolean;
}

interface DeveloperGrowth {
  month: string;
  year: string;
  count: number;
  cumulative: number;
}

interface PropertyGrowth {
  month: string;
  year: string;
  count: number;
  cumulative: number;
}

interface TopDeveloper {
  developerId: string;
  developerName: string;
  propertyCount: number;
}

interface MostRequestedVisit {
  propertyId: string;
  propertyTitle: string;
  visitCount: number;
}

interface PropertyTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

const COLORS = ['#C7A667', '#8B6F47', '#A67C52', '#D4AF37', '#B8860B', '#CD853F', '#DEB887', '#F4A460'];

export default function AnalyticsPage({ isDarkMode }: AnalyticsPageProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');
  const [developerGrowth, setDeveloperGrowth] = useState<DeveloperGrowth[]>([]);
  const [propertyGrowth, setPropertyGrowth] = useState<PropertyGrowth[]>([]);
  const [topDevelopers, setTopDevelopers] = useState<TopDeveloper[]>([]);
  const [mostRequestedVisits, setMostRequestedVisits] = useState<MostRequestedVisit[]>([]);
  const [propertyTypeDistribution, setPropertyTypeDistribution] = useState<PropertyTypeDistribution[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    loadAnalytics();
  }, [timeRange, user?.id]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        setDeveloperGrowth([]);
        setPropertyGrowth([]);
        setTopDevelopers([]);
        setMostRequestedVisits([]);
        setPropertyTypeDistribution([]);
        return;
      }
      // Load all data in parallel
      const [
        developersData,
        propertiesData,
        visitsData,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, created_at, first_name, last_name, company_name')
          .eq('user_type', 'developer')
          .eq('id', user.id) as any,
        propertiesService.getDeveloperProperties(user.id),
        supabase
          .from('scheduled_visits')
          .select('property_id, developer_id, created_at')
          .eq('developer_id', user.id) as any,
      ]);

      const developers = developersData.data || [];
      const properties = propertiesData.properties || [];
      const visits = visitsData.data || [];

      // Process developer growth
      const devGrowth = processGrowthData(developers, timeRange);
      setDeveloperGrowth(devGrowth);

      // Process property growth
      const propGrowth = processPropertyGrowth(properties, timeRange);
      setPropertyGrowth(propGrowth);

      // Process top developers by property count
      const topDevs = processTopDevelopers(developers, properties);
      setTopDevelopers(topDevs.slice(0, 10)); // Top 10

      // Process most requested visits
      const requestedVisits = processMostRequestedVisits(visits, properties);
      setMostRequestedVisits(requestedVisits.slice(0, 10)); // Top 10

      // Process property type distribution
      const typeDist = processPropertyTypeDistribution(properties);
      setPropertyTypeDistribution(typeDist);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const processGrowthData = (data: any[], range: 'month' | 'year'): DeveloperGrowth[] => {
    const grouped: Record<string, number> = {};
    const sorted = [...data].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    sorted.forEach((item) => {
      const date = new Date(item.created_at);
      const key = range === 'month' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : String(date.getFullYear());
      
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const result: DeveloperGrowth[] = [];
    let cumulative = 0;
    
    Object.keys(grouped).sort().forEach((key) => {
      cumulative += grouped[key];
      const [year, month] = key.split('-');
      result.push({
        month: month || '',
        year: year,
        count: grouped[key],
        cumulative,
      });
    });

    return result;
  };

  const processPropertyGrowth = (properties: any[], range: 'month' | 'year'): PropertyGrowth[] => {
    const grouped: Record<string, number> = {};
    const sorted = [...properties].sort((a, b) => 
      new Date(a.createdAt || a.created_at).getTime() - new Date(b.createdAt || b.created_at).getTime()
    );

    sorted.forEach((property) => {
      const date = new Date(property.createdAt || property.created_at);
      const key = range === 'month' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : String(date.getFullYear());
      
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const result: PropertyGrowth[] = [];
    let cumulative = 0;
    
    Object.keys(grouped).sort().forEach((key) => {
      cumulative += grouped[key];
      const [year, month] = key.split('-');
      result.push({
        month: month || '',
        year: year,
        count: grouped[key],
        cumulative,
      });
    });

    return result;
  };

  const processTopDevelopers = (developers: any[], properties: any[]): TopDeveloper[] => {
    const devCounts: Record<string, { name: string; count: number }> = {};

    developers.forEach((dev) => {
      const devName = dev.company_name || `${dev.first_name} ${dev.last_name}`.trim() || 'Unknown';
      devCounts[dev.id] = { name: devName, count: 0 };
    });

    properties.forEach((prop) => {
      const devId = prop.developerId || prop.developer_id;
      if (devId && devCounts[devId]) {
        devCounts[devId].count++;
      }
    });

    return Object.entries(devCounts)
      .map(([developerId, data]) => ({
        developerId,
        developerName: data.name,
        propertyCount: data.count,
      }))
      .sort((a, b) => b.propertyCount - a.propertyCount);
  };

  const processMostRequestedVisits = (visits: any[], properties: any[]): MostRequestedVisit[] => {
    const visitCounts: Record<string, number> = {};
    const propertyMap = new Map(properties.map(p => [p.id, p]));

    visits.forEach((visit) => {
      const propId = visit.property_id;
      visitCounts[propId] = (visitCounts[propId] || 0) + 1;
    });

    return Object.entries(visitCounts)
      .map(([propertyId, visitCount]) => {
        const property = propertyMap.get(propertyId);
        return {
          propertyId,
          propertyTitle: property?.title || 'Unknown Property',
          visitCount,
        };
      })
      .sort((a, b) => b.visitCount - a.visitCount);
  };

  const processPropertyTypeDistribution = (properties: any[]): PropertyTypeDistribution[] => {
    const typeCounts: Record<string, number> = {};

    properties.forEach((prop) => {
      const type = prop.propertyType || prop.property_type || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const total = properties.length;
    return Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const chartData = useMemo(() => {
    // Get all unique periods from both datasets
    const allPeriods = new Set<string>();
    
    developerGrowth.forEach(item => {
      const period = timeRange === 'month' ? `${item.year}-${item.month}` : item.year;
      allPeriods.add(period);
    });
    
    propertyGrowth.forEach(item => {
      const period = timeRange === 'month' ? `${item.year}-${item.month}` : item.year;
      allPeriods.add(period);
    });

    // Create combined data
    return Array.from(allPeriods).sort().map(period => {
      let devCumulative = 0;
      let propCumulative = 0;

      if (timeRange === 'month') {
        const [year, month] = period.split('-');
        const devItem = developerGrowth.find(d => d.year === year && d.month === month);
        const propItem = propertyGrowth.find(p => p.year === year && p.month === month);
        devCumulative = devItem?.cumulative || 0;
        propCumulative = propItem?.cumulative || 0;
      } else {
        const devItem = developerGrowth.find(d => d.year === period);
        const propItem = propertyGrowth.find(p => p.year === period);
        devCumulative = devItem?.cumulative || 0;
        propCumulative = propItem?.cumulative || 0;
      }

      return {
        period,
        developers: devCumulative,
        properties: propCumulative,
      };
    });
  }, [developerGrowth, propertyGrowth, timeRange]);

  const monthlyPropertyData = useMemo(() => {
    if (timeRange === 'month') {
      return propertyGrowth.map(item => ({
        period: `${item.year}-${item.month}`,
        count: item.count,
      }));
    } else {
      // Group by year
      const yearGroups: Record<string, number> = {};
      propertyGrowth.forEach(item => {
        yearGroups[item.year] = (yearGroups[item.year] || 0) + item.count;
      });
      return Object.entries(yearGroups).map(([year, count]) => ({
        period: year,
        count,
      }));
    }
  }, [propertyGrowth, timeRange]);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        className={`p-4 sm:p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive insights into platform growth and performance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 dark:bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  timeRange === 'month'
                    ? 'bg-[#C7A667] text-black'
                    : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  timeRange === 'year'
                    ? 'bg-[#C7A667] text-black'
                    : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
              </button>
            </div>
            <button
              onClick={loadAnalytics}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-white/10 text-white hover:bg-white/20 disabled:opacity-50'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Developer Growth */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Developer Growth</h3>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#ffffff20' : '#e5e7eb'} />
                <XAxis 
                  dataKey="period" 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="developers" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Total Developers"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-gray-500">
              No data available
            </div>
          )}
        </motion.div>

        {/* Property Growth */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Property Growth</h3>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          ) : monthlyPropertyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyPropertyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#ffffff20' : '#e5e7eb'} />
                <XAxis 
                  dataKey="period" 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#C7A667" name="Properties Posted" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-gray-500">
              No data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Developers and Property Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Developers by Property Uploads */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Top Developers by Property Uploads</h3>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          ) : topDevelopers.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDevelopers.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#ffffff20' : '#e5e7eb'} />
                <XAxis 
                  type="number"
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="developerName" 
                  stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="propertyCount" fill="#C7A667" name="Properties" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-gray-500">
              No data available
            </div>
          )}
        </motion.div>

        {/* Property Type Distribution */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Property Type Distribution</h3>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          ) : propertyTypeDistribution.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={propertyTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {propertyTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {propertyTypeDistribution.map((item, index) => (
                  <div key={item.type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {item.type}
                      </span>
                    </div>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-gray-500">
              No data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Most Requested Site Visits */}
      <motion.div
        className={`p-4 sm:p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-semibold">Most Requested Site Visits</h3>
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        ) : mostRequestedVisits.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mostRequestedVisits.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#ffffff20' : '#e5e7eb'} />
              <XAxis 
                dataKey="propertyTitle" 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="visitCount" fill="#ef4444" name="Visit Requests" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-sm text-gray-500">
            No visit data available
          </div>
        )}
      </motion.div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Average Properties per Developer */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold">Avg Properties/Developer</h4>
          </div>
          {loading ? (
            <div className="h-8 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ) : (
            <p className="text-3xl font-bold">
              {topDevelopers.length > 0
                ? (topDevelopers.reduce((sum, d) => sum + d.propertyCount, 0) / topDevelopers.length).toFixed(1)
                : '0.0'}
            </p>
          )}
        </motion.div>

        {/* Total Site Visit Requests */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <h4 className="font-semibold">Total Visit Requests</h4>
          </div>
          {loading ? (
            <div className="h-8 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ) : (
            <p className="text-3xl font-bold">
              {mostRequestedVisits.reduce((sum, v) => sum + v.visitCount, 0)}
            </p>
          )}
        </motion.div>

        {/* Most Popular Property Type */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold">Most Popular Type</h4>
          </div>
          {loading ? (
            <div className="h-8 w-16 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ) : propertyTypeDistribution.length > 0 ? (
            <div>
              <p className="text-2xl font-bold">{propertyTypeDistribution[0].type}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {propertyTypeDistribution[0].count} properties ({propertyTypeDistribution[0].percentage.toFixed(1)}%)
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

