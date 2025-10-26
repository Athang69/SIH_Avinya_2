import { useEffect, useState } from 'react';
import { CreditCard, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { FacilityType, FacilityStatus } from '../../lib/database.types';

interface CreditFacility {
  id: string;
  facility_type: FacilityType;
  provider: string;
  amount: number;
  status: FacilityStatus;
  application_date: string;
  approval_date: string | null;
  performance_score: number | null;
}

export default function CreditView() {
  const { profile } = useAuth();
  const [facilities, setFacilities] = useState<CreditFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, [profile]);

  const loadFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_facilities')
        .select('*')
        .eq('farmer_id', profile?.id || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFacilities(data || []);
    } catch (error) {
      console.error('Error loading credit facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: FacilityStatus) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'disbursed': return 'bg-emerald-100 text-emerald-700';
      case 'applied': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: FacilityType) => {
    return CreditCard;
  };

  const totalApproved = facilities
    .filter(f => ['approved', 'disbursed'].includes(f.status))
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingApplications = facilities.filter(f => f.status === 'applied').length;

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
          <h2 className="text-2xl font-bold text-gray-900">Credit & Insurance</h2>
          <p className="text-gray-600 mt-1">Access financial support and risk protection</p>
        </div>
        <button
          onClick={() => setShowApplyForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Apply for Facility</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="font-medium text-gray-700">Approved Credit</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{(totalApproved / 100000).toFixed(2)}L</p>
          <p className="text-sm text-gray-500 mt-1">Total approved amount</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-700">Pending Applications</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingApplications}</p>
          <p className="text-sm text-gray-500 mt-1">Under review</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h3 className="font-medium text-gray-700">Performance Score</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {facilities[0]?.performance_score || 'N/A'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Credit rating</p>
        </div>
      </div>

      {showApplyForm && (
        <ApplyForm
          onClose={() => setShowApplyForm(false)}
          onSuccess={() => {
            setShowApplyForm(false);
            loadFacilities();
          }}
        />
      )}

      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Schemes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <h4 className="font-semibold text-gray-900 mb-2">Crop Loan</h4>
            <p className="text-sm text-gray-600 mb-3">Interest rate: 7% p.a.</p>
            <p className="text-xs text-gray-500">Up to ₹3 lakhs at subsidized rates</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <h4 className="font-semibold text-gray-900 mb-2">Crop Insurance</h4>
            <p className="text-sm text-gray-600 mb-3">Premium: 2% of sum insured</p>
            <p className="text-xs text-gray-500">PMFBY scheme coverage</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <h4 className="font-semibold text-gray-900 mb-2">Equipment Subsidy</h4>
            <p className="text-sm text-gray-600 mb-3">Subsidy: Up to 50%</p>
            <p className="text-xs text-gray-500">For farm machinery and equipment</p>
          </div>
        </div>
      </div>

      {facilities.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600">Start by applying for credit, insurance, or subsidy</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {facilities.map((facility) => {
                  const TypeIcon = getTypeIcon(facility.facility_type);

                  return (
                    <tr key={facility.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                            <TypeIcon className="w-5 h-5 text-emerald-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {facility.facility_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{facility.provider}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          ₹{(facility.amount / 1000).toFixed(0)}K
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {new Date(facility.application_date).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(facility.status)}`}>
                          {facility.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplyForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    facility_type: 'credit' as FacilityType,
    provider: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('credit_facilities').insert([{
        farmer_id: profile?.id,
        facility_type: formData.facility_type,
        provider: formData.provider,
        amount: parseFloat(formData.amount),
        status: 'applied',
        application_date: new Date().toISOString().split('T')[0],
        metadata: {},
      }]);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error applying for facility:', error);
      alert('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Apply for Credit/Insurance</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Type
            </label>
            <select
              value={formData.facility_type}
              onChange={(e) => setFormData({ ...formData, facility_type: e.target.value as FacilityType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="credit">Credit/Loan</option>
              <option value="insurance">Insurance</option>
              <option value="subsidy">Subsidy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider/Bank Name
            </label>
            <input
              type="text"
              required
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., State Bank of India"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter amount"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
