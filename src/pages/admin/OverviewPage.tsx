import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import {
  Users,
  Building2,
  Megaphone,
  DollarSign,
  Activity,
  Calendar,
  BarChart3,
  Shield,
} from 'lucide-react';

interface OverviewPageProps {
  isDarkMode: boolean;
}

interface OverviewStats {
  totalDevelopers: number;
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  pendingProperties: number;
  totalCampaigns: number;
  activeCampaigns: number;
  pendingCampaigns: number;
  failedCampaigns: number;
  totalVisits: number;
}

export default function OverviewPage({ isDarkMode }: OverviewPageProps) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        const [
          { data: devs },
          { data: props },
          { data: campaigns },
          { data: visits },
        ] = await Promise.all([
          supabase.from('profiles').select('id').eq('user_type', 'developer') as any,
          supabase.from('properties').select('id,status') as any,
          supabase.from('campaigns').select('id,status') as any,
          supabase.from('scheduled_visits').select('id') as any,
        ]);

        const developers = devs || [];
        const properties = props || [];
        const campaignRows = campaigns || [];
        const visitRows = visits || [];

        const totalDevelopers = developers.length;
        const totalProperties = properties.length;
        const activeProperties = properties.filter((p: any) => p.status === 'active').length;
        const soldProperties = properties.filter((p: any) => p.status === 'sold').length;
        const pendingProperties = properties.filter((p: any) => p.status === 'pending').length;

        const totalCampaigns = campaignRows.length;
        const activeCampaigns = campaignRows.filter((c: any) => c.status === 'active').length;
        const pendingCampaigns = campaignRows.filter((c: any) => c.status === 'pending').length;
        const failedCampaigns = campaignRows.filter((c: any) => c.status === 'failed').length;

        const totalVisits = visitRows.length;

        setStats({
          totalDevelopers,
          totalProperties,
          activeProperties,
          soldProperties,
          pendingProperties,
          totalCampaigns,
          activeCampaigns,
          pendingCampaigns,
          failedCampaigns,
          totalVisits,
        });
      } catch (err) {
        console.error('Error loading admin overview stats:', err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const propertyBreakdown = useMemo(() => {
    if (!stats) return [];
    const items = [
      { label: 'Active', value: stats.activeProperties, color: 'bg-emerald-500' },
      { label: 'Sold', value: stats.soldProperties, color: 'bg-blue-500' },
      { label: 'Pending', value: stats.pendingProperties, color: 'bg-amber-500' },
    ];
    const max = Math.max(...items.map(i => i.value), 1);
    return items.map(i => ({ ...i, percent: (i.value / max) * 100 }));
  }, [stats]);

  const campaignBreakdown = useMemo(() => {
    if (!stats) return [];
    const items = [
      { label: 'Active', value: stats.activeCampaigns, color: 'bg-emerald-500' },
      { label: 'Pending', value: stats.pendingCampaigns, color: 'bg-amber-500' },
      { label: 'Failed', value: stats.failedCampaigns, color: 'bg-rose-500' },
    ];
    const max = Math.max(...items.map(i => i.value), 1);
    return items.map(i => ({ ...i, percent: (i.value / max) * 100 }));
  }, [stats]);

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
            <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Admin Overview</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High-level snapshot of developers, properties, campaigns and activity.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
              <Activity className="w-4 h-4" />
              <span>Live</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Updated in real-time</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          isDarkMode={isDarkMode}
          title="Total Developers"
          value={stats?.totalDevelopers ?? 0}
          icon={Users}
          tone="blue"
          loading={loading}
        />
        <StatCard
          isDarkMode={isDarkMode}
          title="Total Properties"
          value={stats?.totalProperties ?? 0}
          icon={Building2}
          tone="purple"
          loading={loading}
        />
        <StatCard
          isDarkMode={isDarkMode}
          title="Active Campaigns"
          value={stats?.activeCampaigns ?? 0}
          icon={Megaphone}
          tone="amber"
          loading={loading}
        />
        <StatCard
          isDarkMode={isDarkMode}
          title="Scheduled Visits"
          value={stats?.totalVisits ?? 0}
          icon={BarChart3}
          tone="emerald"
          loading={loading}
        />
      </div>

      {/* Graph-style sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Property status breakdown */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Property Status Overview</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Distribution of all properties by lifecycle.
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              Total: {stats?.totalProperties ?? 0}
            </span>
          </div>

          {loading ? (
            <SkeletonBars isDarkMode={isDarkMode} />
          ) : (
            <div className="space-y-3">
              {propertyBreakdown.map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {item.label}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.value}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Campaign status breakdown */}
        <motion.div
          className={`p-4 sm:p-6 rounded-2xl ${
            isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Campaign Status Overview</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Snapshot of all marketing campaigns.
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              Total: {stats?.totalCampaigns ?? 0}
            </span>
          </div>

          {loading ? (
            <SkeletonBars isDarkMode={isDarkMode} />
          ) : (
            <div className="space-y-3">
              {campaignBreakdown.map(item => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {item.label}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.value}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick metrics cards */}
      <motion.div
        className={`p-4 sm:p-6 rounded-2xl ${
          isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Platform Highlights</h3>
          <DollarSign className="w-4 h-4 text-emerald-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Developers</p>
            <p className="text-lg font-semibold">
              {stats?.totalDevelopers ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Properties per Developer</p>
            <p className="text-lg font-semibold">
              {stats && stats.totalDevelopers > 0
                ? (stats.totalProperties / stats.totalDevelopers).toFixed(1)
                : '0.0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Campaigns per Developer</p>
            <p className="text-lg font-semibold">
              {stats && stats.totalDevelopers > 0
                ? (stats.totalCampaigns / stats.totalDevelopers).toFixed(1)
                : '0.0'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  isDarkMode: boolean;
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  tone: 'blue' | 'purple' | 'amber' | 'emerald';
  loading: boolean;
}

function StatCard({ isDarkMode, title, value, icon: Icon, tone, loading }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
  };

  return (
    <motion.div
      className={`p-4 sm:p-6 rounded-2xl ${
        isDarkMode ? 'bg-[#0E0E10] border border-white/10' : 'bg-white border border-gray-200'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorMap[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</span>
      </div>
      {loading ? (
        <div className="h-7 w-20 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ) : (
        <p className="text-2xl font-bold">{value}</p>
      )}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{title}</p>
    </motion.div>
  );
}

function SkeletonBars({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className={`h-3 w-20 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
            <div className={`h-3 w-8 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
          </div>
          <div className={`h-2 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`} />
        </div>
      ))}
    </div>
  );
}


