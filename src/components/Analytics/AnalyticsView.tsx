import { useEffect, useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Define types for your Supabase query results
interface Crop {
  area_hectares: number;
}

interface InventoryItem {
  quantity_kg: number;
}

interface Warehouse {
  capacity_tonnes: number;
  current_utilization_tonnes: number;
}

interface Price {
  price_per_kg: number;
}

interface Metrics {
  totalProduction: number;
  totalProcurement: number;
  averagePrice: number;
  utilizationRate: number;
}

export default function AnalyticsView() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalProduction: 0,
    totalProcurement: 0,
    averagePrice: 0,
    utilizationRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [cropsResult, inventoryResult, warehousesResult, pricesResult] = await Promise.all([
        supabase.from<Crop>('crops').select('area_hectares'),
        supabase.from<InventoryItem>('inventory').select('quantity_kg'),
        supabase.from<Warehouse>('warehouses').select('capacity_tonnes, current_utilization_tonnes'),
        supabase.from<Price>('market_prices').select('price_per_kg').eq('is_prediction', false).limit(100),
      ]);

      const totalArea = cropsResult.data?.reduce((sum: number, crop: Crop) => sum + crop.area_hectares, 0) || 0;
      const totalInventory = inventoryResult.data?.reduce((sum: number, item: InventoryItem) => sum + item.quantity_kg, 0) || 0;

      const warehouses = warehousesResult.data || [];
      const totalCapacity = warehouses.reduce((sum: number, w: Warehouse) => sum + w.capacity_tonnes, 0);
      const totalUtilization = warehouses.reduce((sum: number, w: Warehouse) => sum + w.current_utilization_tonnes, 0);

      const prices = pricesResult.data || [];
      const avgPrice = prices.length > 0
        ? prices.reduce((sum: number, p: Price) => sum + p.price_per_kg, 0) / prices.length
        : 0;

      setMetrics({
        totalProduction: totalArea,
        totalProcurement: totalInventory,
        averagePrice: avgPrice,
        utilizationRate: totalCapacity > 0 ? (totalUtilization / totalCapacity) * 100 : 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Analytics</h2>
        <p className="text-gray-600 mt-1">Comprehensive insights into oilseed value chain performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Production Area"
          value={`${metrics.totalProduction.toFixed(1)} Ha`}
          icon={TrendingUp}
          trend={15.3}
          color="emerald"
        />
        <MetricCard
          title="Total Procurement"
          value={`${(metrics.totalProcurement / 1000000).toFixed(2)} MT`}
          icon={BarChart3}
          trend={8.7}
          color="blue"
        />
        <MetricCard
          title="Avg Market Price"
          value={`₹${metrics.averagePrice.toFixed(2)}/kg`}
          icon={Activity}
          trend={-2.4}
          color="amber"
        />
        <MetricCard
          title="Warehouse Utilization"
          value={`${metrics.utilizationRate.toFixed(1)}%`}
          icon={PieChart}
          trend={5.2}
          color="purple"
        />
      </div>

      {/* Remaining layout unchanged */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Trends</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Production trend chart</p>
              <p className="text-sm text-gray-400 mt-1">AI-powered predictive analytics</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Predictions</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Price forecast chart</p>
              <p className="text-sm text-gray-400 mt-1">ML-based demand-supply predictions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h3>
        <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-center">
            <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Regional distribution map</p>
            <p className="text-sm text-gray-400 mt-1">Satellite data integration for crop monitoring</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Decision Support</h3>
            <p className="text-gray-700 mb-4">
              Based on current data and predictive models, here are key recommendations:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">Increase soybean procurement by 12% to meet projected Q3 demand</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">Optimize warehouse utilization in Maharashtra region (currently at 45%)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">Weather predictions indicate favorable conditions for mustard planting next month</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: number;
  color: 'emerald' | 'blue' | 'amber' | 'purple';
}

function MetricCard({ title, value, icon: Icon, trend, color }: MetricCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
          <span className="font-medium">{Math.abs(trend)}%</span>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
