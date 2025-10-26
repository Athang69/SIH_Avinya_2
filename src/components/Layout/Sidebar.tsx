import { LayoutDashboard, Sprout, Package, Truck, Link as LinkIcon, CreditCard, TrendingUp, Warehouse, Bell, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../lib/database.types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['farmer', 'fpo', 'processor', 'retailer', 'policymaker', 'admin'] },
  { id: 'crops', label: 'My Crops', icon: Sprout, roles: ['farmer'] },
  { id: 'advisories', label: 'Advisories', icon: Bell, roles: ['farmer', 'fpo', 'processor', 'retailer', 'policymaker', 'admin'] },
  { id: 'inventory', label: 'Inventory', icon: Package, roles: ['farmer', 'fpo', 'processor', 'retailer'] },
  { id: 'warehouses', label: 'Warehouses', icon: Warehouse, roles: ['fpo', 'processor', 'retailer', 'policymaker', 'admin'] },
  { id: 'logistics', label: 'Logistics', icon: Truck, roles: ['fpo', 'processor', 'retailer'] },
  { id: 'traceability', label: 'Traceability', icon: LinkIcon, roles: ['farmer', 'fpo', 'processor', 'retailer', 'policymaker', 'admin'] },
  { id: 'credit', label: 'Credit & Insurance', icon: CreditCard, roles: ['farmer'] },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, roles: ['policymaker', 'admin'] },
  { id: 'stakeholders', label: 'Stakeholders', icon: Users, roles: ['policymaker', 'admin'] },
];

export default function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const filteredNavItems = navItems.filter(item =>
    profile?.role && item.roles.includes(profile.role)
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Oilseed Platform</h1>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          onClick={() => setCurrentView('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            currentView === 'settings'
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
