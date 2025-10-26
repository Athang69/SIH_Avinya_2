import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Package, Truck, AlertCircle, Sprout } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  totalCrops?: number;
  activeAdvisories?: number;
  inventoryValue?: number;
  activeShipments?: number;
  pendingCredit?: number;
}

export default function DashboardView() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentAdvisories, setRecentAdvisories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      if (profile?.role === 'farmer') {
        const [cropsResult, advisoriesResult, creditResult] = await Promise.all([
          supabase.from('crops').select('id').eq('farmer_id', profile.id),
          supabase.from('advisories').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('credit_facilities').select('id').eq('farmer_id', profile.id).eq('status', 'applied'),
        ]);

        setStats({
          totalCrops: cropsResult.data?.length || 0,
          activeAdvisories: advisoriesResult.data?.length || 0,
          pendingCredit: creditResult.data?.length || 0,
        });

        setRecentAdvisories(advisoriesResult.data || []);
      } else if (['fpo', 'processor', 'retailer'].includes(profile?.role || '')) {
        const [inventoryResult, logisticsResult, advisoriesResult] = await Promise.all([
          supabase.from('inventory').select('quantity_kg, price_per_kg').eq('owner_id', profile?.id || ''),
          supabase.from('logistics').select('id').eq('status', 'in_transit'),
          supabase.from('advisories').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        const inventoryValue = inventoryResult.data?.reduce((sum, item) => {
          return sum + (item.quantity_kg * (item.price_per_kg || 0));
        }, 0) || 0;

        setStats({
          inventoryValue,
          activeShipments: logisticsResult.data?.length || 0,
          activeAdvisories: advisoriesResult.data?.length || 0,
        });

        setRecentAdvisories(advisoriesResult.data || []);
      } else if (['policymaker', 'admin'].includes(profile?.role || '')) {
        const [cropsResult, inventoryResult, advisoriesResult] = await Promise.all([
          supabase.from('crops').select('id'),
          supabase.from('inventory').select('id'),
          supabase.from('advisories').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        setStats({
          totalCrops: cropsResult.data?.length || 0,
          inventoryValue: inventoryResult.data?.length || 0,
          activeAdvisories: advisoriesResult.data?.length || 0,
        });

        setRecentAdvisories(advisoriesResult.data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.full_name}</h2>
        <p className="text-gray-600 mt-1">Here's what's happening with your oilseed value chain today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {profile?.role === 'farmer' && (
          <>
            <StatCard
              title="Active Crops"
              value={stats.totalCrops || 0}
              icon={Sprout}
              trend={5}
              color="emerald"
            />
            <StatCard
              title="Active Advisories"
              value={stats.activeAdvisories || 0}
              icon={AlertCircle}
              color="blue"
            />
            <StatCard
              title="Pending Credit"
              value={stats.pendingCredit || 0}
              icon={Package}
              color="amber"
            />
          </>
        )}

        {['fpo', 'processor', 'retailer'].includes(profile?.role || '') && (
          <>
            <StatCard
              title="Inventory Value"
              value={`₹${((stats.inventoryValue || 0) / 1000).toFixed(1)}K`}
              icon={Package}
              trend={8}
              color="emerald"
            />
            <StatCard
              title="Active Shipments"
              value={stats.activeShipments || 0}
              icon={Truck}
              color="blue"
            />
            <StatCard
              title="Active Advisories"
              value={stats.activeAdvisories || 0}
              icon={AlertCircle}
              color="amber"
            />
          </>
        )}

        {['policymaker', 'admin'].includes(profile?.role || '') && (
          <>
            <StatCard
              title="Total Crops Tracked"
              value={stats.totalCrops || 0}
              icon={Sprout}
              trend={12}
              color="emerald"
            />
            <StatCard
              title="Inventory Records"
              value={stats.inventoryValue || 0}
              icon={Package}
              trend={7}
              color="blue"
            />
            <StatCard
              title="Active Advisories"
              value={stats.activeAdvisories || 0}
              icon={AlertCircle}
              color="amber"
            />
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Advisories</h3>
          <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {recentAdvisories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No advisories available</p>
          ) : (
            recentAdvisories.map((advisory) => (
              <div
                key={advisory.id}
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${getPriorityColor(advisory.priority)}`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{advisory.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getPriorityColor(advisory.priority)}`}>
                      {advisory.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{advisory.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(advisory.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: number;
  color: 'emerald' | 'blue' | 'amber' | 'red';
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
