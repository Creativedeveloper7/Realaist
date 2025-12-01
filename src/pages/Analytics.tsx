import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { propertiesService } from '../services/propertiesService';
import { scheduledVisitsService } from '../services/scheduledVisitsService';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Building2,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock,
  Star,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface AnalyticsProps {
  isDarkMode: boolean;
}

interface PropertyAnalytics {
  id: string;
  title: string;
  location: string;
  price: number;
  views: number;
  visits: number;
  inquiries: number;
  conversionRate: number;
  avgTimeOnPage: number;
  status: string;
  uploadDate: string;
  lastUpdated: string;
}

interface MonthlyData {
  month: string;
  views: number;
  visits: number;
  inquiries: number;
  revenue: number;
}

interface LocationAnalytics {
  location: string;
  properties: number;
  totalViews: number;
  avgPrice: number;
  conversionRate: number;
}

export const Analytics: React.FC<AnalyticsProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'visits' | 'inquiries' | 'revenue'>('views');
  const [propertyAnalytics, setPropertyAnalytics] = useState<PropertyAnalytics[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [locationAnalytics, setLocationAnalytics] = useState<LocationAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setPropertyAnalytics([]);
        setMonthlyData([]);
        setLocationAnalytics([]);
        return;
      }
      setLoading(true);
      try {
        const [{ properties }, { visits, error: visitsError }] = await Promise.all([
          propertiesService.getDeveloperProperties(user.id),
          scheduledVisitsService.getDeveloperScheduledVisits(user.id),
        ]);

        const safeVisits = visitsError || !visits ? [] : visits;

        // Map properties to analytics structure
        const analytics: PropertyAnalytics[] = properties.map((p) => {
          const propVisits = safeVisits.filter((v: any) => v.propertyId === p.id || v.property_id === p.id);
          return {
            id: p.id,
            title: p.title,
            location: p.location || 'Unknown location',
            price: typeof p.price === 'number' ? p.price : 0,
            views: 0,
            visits: propVisits.length,
            inquiries: 0,
            conversionRate: propVisits.length > 0 ? 0.5 : 0,
            avgTimeOnPage: 0,
            status: (p as any).status || 'Active',
            uploadDate: p.createdAt,
            lastUpdated: p.updatedAt,
          };
        });
        setPropertyAnalytics(analytics);

        // Build simple monthly data based on property creation and visits
        const monthlyMap: Record<string, MonthlyData> = {};
        analytics.forEach((prop) => {
          const d = new Date(prop.uploadDate);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          if (!monthlyMap[key]) {
            monthlyMap[key] = { month: key, views: 0, visits: 0, inquiries: 0, revenue: 0 };
          }
          monthlyMap[key].revenue += prop.price;
          monthlyMap[key].visits += prop.visits;
        });
        const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
        setMonthlyData(monthly);

        // Location analytics grouped by property location
        const locMap: Record<string, { properties: number; totalViews: number; totalPrice: number }> = {};
        analytics.forEach((prop) => {
          const loc = prop.location || 'Unknown';
          if (!locMap[loc]) {
            locMap[loc] = { properties: 0, totalViews: 0, totalPrice: 0 };
          }
          locMap[loc].properties += 1;
          locMap[loc].totalViews += prop.views;
          locMap[loc].totalPrice += prop.price;
        });
        const locations: LocationAnalytics[] = Object.entries(locMap).map(([location, stats]) => ({
          location,
          properties: stats.properties,
          totalViews: stats.totalViews,
          avgPrice: stats.properties > 0 ? stats.totalPrice / stats.properties : 0,
          conversionRate: 0,
        }));
        setLocationAnalytics(locations);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const totalStats = {
    totalProperties: propertyAnalytics.length,
    totalViews: propertyAnalytics.reduce((sum, prop) => sum + prop.views, 0),
    totalVisits: propertyAnalytics.reduce((sum, prop) => sum + prop.visits, 0),
    totalInquiries: propertyAnalytics.reduce((sum, prop) => sum + prop.inquiries, 0),
    totalRevenue: propertyAnalytics.reduce((sum, prop) => sum + prop.price, 0),
    avgConversionRate:
      propertyAnalytics.length > 0
        ? propertyAnalytics.reduce((sum, prop) => sum + prop.conversionRate, 0) / propertyAnalytics.length
        : 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Sold':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Pending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getMaxValue = (data: MonthlyData[], key: keyof MonthlyData) => {
    return Math.max(...data.map(item => item[key] as number));
  };

  const SimpleBarChart: React.FC<{ data: MonthlyData[], metric: keyof MonthlyData }> = ({ data, metric }) => {
    const maxValue = getMaxValue(data, metric);
    
    return (
      <div className="flex items-end justify-between h-32 sm:h-40 md:h-48 lg:h-64 gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 min-w-0 w-full max-w-full">
        {data.map((item, index) => {
          const height = ((item[metric] as number) / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1 min-w-0 max-w-full">
              <div className="w-full max-w-full bg-gray-200 dark:bg-white/10 rounded-t-sm sm:rounded-t-md md:rounded-t-lg relative" style={{ height: `${height}%`, minHeight: '4px' }}>
                <div className="absolute inset-0 bg-[#C7A667] rounded-t-sm sm:rounded-t-md md:rounded-t-lg"></div>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2 truncate w-full text-center px-0.5">{item.month}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-full min-w-0 space-y-3 sm:space-y-4 md:space-y-6 pb-4 sm:pb-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        className={`p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl w-full max-w-full min-w-0 ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 md:gap-4">
          <div className="min-w-0 flex-1 w-full">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 truncate">Analytics Dashboard</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 line-clamp-2">
              Comprehensive insights into your property portfolio performance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 md:gap-3 w-full sm:w-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg border text-xs sm:text-sm w-full sm:w-auto ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-white' 
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#C7A667] focus:border-transparent`}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <motion.button
              className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-[#C7A667] text-black rounded-lg font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base whitespace-nowrap w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Export</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-3 md:gap-4 lg:gap-6 w-full max-w-full min-w-0">
        {[
          {
            title: 'Total Properties',
            value: totalStats.totalProperties.toString(),
            change: '+2',
            icon: Building2,
            color: 'text-blue-500'
          },
          {
            title: 'Scheduled Visits',
            value: totalStats.totalVisits.toString(),
            change: '+5',
            icon: MessageSquare,
            color: 'text-purple-500'
          },
          {
            title: 'Total Revenue',
            value: formatCurrency(totalStats.totalRevenue),
            change: '+12%',
            icon: DollarSign,
            color: 'text-[#C7A667]'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className={`p-1.5 sm:p-2.5 md:p-4 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl w-full max-w-full min-w-0 ${
                isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 gap-0.5 sm:gap-1">
                <div className={`p-1 sm:p-1.5 md:p-2 lg:p-3 rounded-md sm:rounded-lg flex-shrink-0 ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <Icon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-6 lg:h-6 ${stat.color}`} />
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm text-green-500 font-medium flex items-center gap-0.5 flex-shrink-0">
                  <TrendingUp size={8} className="sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                  <span className="whitespace-nowrap">{stat.change}</span>
                </span>
              </div>
              <h3 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-2xl font-bold mb-0.5 sm:mb-1 truncate min-w-0 w-full">{stat.value}</h3>
              <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm truncate min-w-0 w-full">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 w-full max-w-full min-w-0">
        {/* Monthly Trends */}
        <motion.div
          className={`p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl w-full max-w-full min-w-0 ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold truncate w-full sm:w-auto">Monthly Performance</h3>
            <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 w-full sm:w-auto">
              {['views', 'visits', 'inquiries', 'revenue'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric as any)}
                  className={`px-1.5 sm:px-2 md:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-1 sm:flex-none ${
                    selectedMetric === metric
                      ? 'bg-[#C7A667] text-black'
                      : isDarkMode
                        ? 'bg-white/10 text-white/70 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="h-32 sm:h-40 md:h-48 lg:h-64 overflow-x-auto -mx-1 sm:-mx-2 md:mx-0 px-1 sm:px-2 md:px-0 w-full max-w-full">
            <SimpleBarChart data={monthlyData} metric={selectedMetric} />
          </div>
          <div className="mt-2 sm:mt-3 md:mt-4 flex justify-between text-[10px] sm:text-xs md:text-sm text-gray-500">
            <span className="truncate">Oct 2023</span>
            <span className="truncate">Jan 2024</span>
          </div>
        </motion.div>

        {/* Conversion Rates */}
        <motion.div
          className={`p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl w-full max-w-full min-w-0 ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 truncate">Conversion Rates</h3>
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            {propertyAnalytics.filter(prop => prop.status === 'Active').map((property, index) => (
              <div key={property.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 md:gap-3 w-full">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <p className="font-medium text-xs sm:text-sm truncate w-full">{property.title}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate w-full">{property.location}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                  <div className="w-16 sm:w-20 md:w-24 bg-gray-200 dark:bg-white/10 rounded-full h-1.5 sm:h-2 flex-1 sm:flex-none">
                    <div 
                      className="bg-[#C7A667] h-full rounded-full transition-all duration-500"
                      style={{ width: `${property.conversionRate * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium w-8 sm:w-10 md:w-12 text-right whitespace-nowrap flex-shrink-0">
                    {(property.conversionRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Location Analytics */}
      <motion.div
        className={`p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl w-full max-w-full min-w-0 ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 truncate">Location Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 w-full max-w-full">
          {locationAnalytics.map((location, index) => (
            <div key={index} className="p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-lg border border-gray-200 dark:border-white/10 min-w-0 max-w-full w-full">
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1.5 sm:mb-2 md:mb-3">
                <MapPin size={10} className="sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-gray-400 flex-shrink-0" />
                <h4 className="font-medium text-xs sm:text-sm md:text-base truncate min-w-0 w-full">{location.location}</h4>
              </div>
              <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                <div className="flex justify-between text-[10px] sm:text-xs md:text-sm gap-1 sm:gap-1.5 md:gap-2">
                  <span className="text-gray-500 truncate min-w-0">Properties</span>
                  <span className="font-medium whitespace-nowrap flex-shrink-0">{location.properties}</span>
                </div>
                <div className="flex justify-between text-[10px] sm:text-xs md:text-sm gap-1 sm:gap-1.5 md:gap-2">
                  <span className="text-gray-500 truncate min-w-0">Views</span>
                  <span className="font-medium whitespace-nowrap flex-shrink-0">{formatNumber(location.totalViews)}</span>
                </div>
                <div className="flex justify-between text-[10px] sm:text-xs md:text-sm gap-1 sm:gap-1.5 md:gap-2">
                  <span className="text-gray-500 truncate min-w-0">Avg Price</span>
                  <span className="font-medium whitespace-nowrap flex-shrink-0 text-right">{formatCurrency(location.avgPrice)}</span>
                </div>
                <div className="flex justify-between text-[10px] sm:text-xs md:text-sm gap-1 sm:gap-1.5 md:gap-2">
                  <span className="text-gray-500 truncate min-w-0">Conversion</span>
                  <span className="font-medium whitespace-nowrap flex-shrink-0">{(location.conversionRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Property Performance Table */}
      <motion.div
        className={`p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl w-full max-w-full min-w-0 ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 truncate">Property Performance</h3>
        <div className="overflow-x-auto -mx-1 sm:-mx-2 md:-mx-3 lg:mx-0 px-1 sm:px-2 md:px-3 lg:px-0 w-full max-w-full">
          <table className="w-full min-w-[500px] sm:min-w-[550px] md:min-w-[600px] lg:min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10">
                <th className="text-left py-1.5 sm:py-2 md:py-3 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-gray-500 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Property</th>
                <th className="text-left py-1.5 sm:py-2 md:py-3 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-gray-500 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Status</th>
                <th className="text-left py-1.5 sm:py-2 md:py-3 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-gray-500 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Views</th>
                <th className="text-left py-1.5 sm:py-2 md:py-3 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-gray-500 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Visits</th>
                <th className="text-left py-1.5 sm:py-2 md:py-3 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-gray-500 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Inquiries</th>
                <th className="text-left py-1.5 sm:py-2 md:py-3 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-gray-500 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Conversion</th>
                <th className="text-left py-1.5 sm:py-2 md:py-3 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-gray-500 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {propertyAnalytics.map((property, index) => (
                <motion.tr
                  key={property.id}
                  className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <td className="py-1.5 sm:py-2 md:py-3 lg:py-4 px-1.5 sm:px-2 md:px-3 lg:px-4">
                    <div className="min-w-[100px] sm:min-w-[120px] md:min-w-[150px] max-w-[100px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-none">
                      <p className="font-medium text-[10px] sm:text-xs md:text-sm truncate w-full">{property.title}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate w-full">{property.location}</p>
                    </div>
                  </td>
                  <td className="py-1.5 sm:py-2 md:py-3 lg:py-4 px-1.5 sm:px-2 md:px-3 lg:px-4">
                    <span className={`px-1 sm:px-1.5 md:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="py-1.5 sm:py-2 md:py-3 lg:py-4 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{formatNumber(property.views)}</td>
                  <td className="py-1.5 sm:py-2 md:py-3 lg:py-4 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{property.visits}</td>
                  <td className="py-1.5 sm:py-2 md:py-3 lg:py-4 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{property.inquiries}</td>
                  <td className="py-1.5 sm:py-2 md:py-3 lg:py-4 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{(property.conversionRate * 100).toFixed(1)}%</td>
                  <td className="py-1.5 sm:py-2 md:py-3 lg:py-4 px-1.5 sm:px-2 md:px-3 lg:px-4 font-medium text-[10px] sm:text-xs md:text-sm whitespace-nowrap">{property.avgTimeOnPage}m</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
