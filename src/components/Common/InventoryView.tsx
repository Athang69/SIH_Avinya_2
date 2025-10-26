import { useEffect, useState } from 'react';
import { Package, Plus, TrendingUp, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { InventoryStatus } from '../../lib/database.types';

interface InventoryItem {
  id: string;
  crop_type: string;
  quantity_kg: number;
  quality_grade: string | null;
  procurement_date: string;
  status: InventoryStatus;
  price_per_kg: number | null;
  warehouses: {
    name: string;
    location: any;
  } | null;
}

export default function InventoryView() {
  const { profile } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, [profile]);

  const loadInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*, warehouses(name, location)')
        .eq('owner_id', profile?.id || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: InventoryStatus) => {
    switch (status) {
      case 'procured': return 'bg-blue-100 text-blue-700';
      case 'stored': return 'bg-green-100 text-green-700';
      case 'in_transit': return 'bg-yellow-100 text-yellow-700';
      case 'processed': return 'bg-purple-100 text-purple-700';
      case 'sold': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalValue = inventory.reduce((sum, item) => {
    return sum + (item.quantity_kg * (item.price_per_kg || 0));
  }, 0);

  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity_kg, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Track and manage your oilseed inventory</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>Add Inventory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h3 className="font-medium text-gray-700">Total Quantity</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(totalQuantity / 1000).toFixed(2)} MT</p>
          <p className="text-sm text-gray-500 mt-1">{totalQuantity.toLocaleString('en-IN')} kg</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-700">Total Value</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{(totalValue / 100000).toFixed(2)}L</p>
          <p className="text-sm text-gray-500 mt-1">₹{totalValue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Package className="w-5 h-5 text-amber-600" />
            <h3 className="font-medium text-gray-700">Inventory Items</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
          <p className="text-sm text-gray-500 mt-1">Tracked items</p>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No inventory yet</h3>
          <p className="text-gray-600">Start adding your inventory to track and manage your stock</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/kg
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                          <Package className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">{item.crop_type}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.procurement_date).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{(item.quantity_kg / 1000).toFixed(2)} MT</div>
                      <div className="text-xs text-gray-500">{item.quantity_kg.toLocaleString('en-IN')} kg</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.quality_grade || 'Standard'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">₹{item.price_per_kg?.toFixed(2) || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{((item.quantity_kg * (item.price_per_kg || 0)) / 1000).toFixed(2)}K
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.warehouses ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {item.warehouses.name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
