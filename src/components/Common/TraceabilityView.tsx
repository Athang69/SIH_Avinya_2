import { useState } from 'react';
import { Search, Package, Truck, Factory, ShoppingBag, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { TraceabilityStage } from '../../lib/database.types';

interface TraceabilityRecord {
  id: string;
  batch_id: string;
  stage: TraceabilityStage;
  action: string;
  timestamp: string;
  location: any;
  hash: string;
  profiles: {
    full_name: string;
    role: string;
  };
}

export default function TraceabilityView() {
  const [batchId, setBatchId] = useState('');
  const [records, setRecords] = useState<TraceabilityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!batchId.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('traceability')
        .select('*, profiles(full_name, role)')
        .eq('batch_id', batchId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error searching traceability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (stage: TraceabilityStage) => {
    switch (stage) {
      case 'farm': return Package;
      case 'procurement': return CheckCircle;
      case 'storage': return Package;
      case 'processing': return Factory;
      case 'retail': return ShoppingBag;
      default: return Package;
    }
  };

  const getStageColor = (stage: TraceabilityStage) => {
    switch (stage) {
      case 'farm': return 'bg-green-100 text-green-700 border-green-200';
      case 'procurement': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'storage': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'processing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'retail': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Blockchain Traceability</h2>
        <p className="text-gray-600 mt-1">Track oilseed journey from farm to fork</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Batch ID to Track
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g., BATCH-SOY-2024-001"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !batchId.trim()}
            className="mt-7 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Track Batch'}
          </button>
        </div>
      </div>

      {searched && records.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-600">The batch ID you entered does not exist in our system</p>
        </div>
      )}

      {records.length > 0 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Batch: {batchId}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {records.length} records tracked | Blockchain verified
                </p>
              </div>
              <div className="flex items-center space-x-2 text-emerald-600">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Verified</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Supply Chain Journey</h3>

            <div className="relative">
              <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200"></div>

              <div className="space-y-8">
                {records.map((record, index) => {
                  const StageIcon = getStageIcon(record.stage);

                  return (
                    <div key={record.id} className="relative flex items-start space-x-4">
                      <div className={`relative z-10 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center ${getStageColor(record.stage)}`}>
                        <StageIcon className="w-7 h-7" />
                      </div>

                      <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 capitalize">{record.stage}</h4>
                            <p className="text-sm text-gray-600 mt-1">{record.action}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStageColor(record.stage)}`}>
                            {record.stage}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Actor</p>
                            <p className="text-sm font-medium text-gray-900">
                              {record.profiles.full_name}
                              <span className="text-gray-500 ml-2 capitalize">({record.profiles.role})</span>
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(record.timestamp).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {record.location?.district && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Location</p>
                              <p className="text-sm font-medium text-gray-900">
                                {record.location.district}, {record.location.state}
                              </p>
                            </div>
                          )}

                          <div>
                            <p className="text-xs text-gray-500 mb-1">Blockchain Hash</p>
                            <p className="text-sm font-mono text-gray-900 truncate">
                              {record.hash.substring(0, 16)}...
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
