import { useEffect, useState } from 'react';
import { AlertCircle, Cloud, Bug, TrendingUp, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { AdvisoryType, PriorityLevel } from '../../lib/database.types';

interface Advisory {
  id: string;
  advisory_type: AdvisoryType;
  title: string;
  content: string;
  priority: PriorityLevel;
  valid_until: string | null;
  created_at: string;
}

export default function AdvisoriesView() {
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AdvisoryType | 'all'>('all');

  useEffect(() => {
    loadAdvisories();
  }, [filter]);

  const loadAdvisories = async () => {
    try {
      let query = supabase
        .from('advisories')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('advisory_type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAdvisories(data || []);
    } catch (error) {
      console.error('Error loading advisories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: AdvisoryType) => {
    switch (type) {
      case 'weather': return Cloud;
      case 'pest_management': return Bug;
      case 'market_price': return TrendingUp;
      default: return AlertCircle;
    }
  };

  const getTypeColor = (type: AdvisoryType) => {
    switch (type) {
      case 'weather': return 'bg-blue-100 text-blue-700';
      case 'pest_management': return 'bg-red-100 text-red-700';
      case 'market_price': return 'bg-green-100 text-green-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-blue-500 bg-blue-50';
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI-Powered Advisories</h2>
          <p className="text-gray-600 mt-1">Stay informed with real-time insights and recommendations</p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as AdvisoryType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="crop_planning">Crop Planning</option>
            <option value="weather">Weather</option>
            <option value="pest_management">Pest Management</option>
            <option value="market_price">Market Price</option>
          </select>
        </div>
      </div>

      {advisories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No advisories available</h3>
          <p className="text-gray-600">Check back later for AI-generated insights and recommendations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {advisories.map((advisory) => {
            const TypeIcon = getTypeIcon(advisory.advisory_type);

            return (
              <div
                key={advisory.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${getPriorityColor(advisory.priority)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(advisory.advisory_type)}`}>
                    <TypeIcon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{advisory.title}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(advisory.advisory_type)}`}>
                            {advisory.advisory_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(advisory.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {advisory.valid_until && (
                            <span className="text-xs text-gray-500">
                              Valid until {new Date(advisory.valid_until).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        advisory.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        advisory.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        advisory.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {advisory.priority}
                      </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {advisory.content}
                    </p>

                    <div className="flex items-center space-x-3 mt-4">
                      <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                        View Details
                      </button>
                      <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                        Mark as Read
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
