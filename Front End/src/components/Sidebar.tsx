import React from 'react';
import { Home, ArrowLeft, User, Building2, Plus, CreditCard, Users, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Item = { id: string; label: string; icon: any; to?: string };

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Menu per role
  // map admin items to existing admin dashboard tabs where possible
  const adminItems: Item[] = [
    { id: 'profile', label: 'Profil', icon: User, to: '/admin?tab=overview' },
    { id: 'add-property', label: 'Tambah Properti', icon: Building2, to: '/admin?tab=kosts' },
    { id: 'add-room', label: 'Tambah Kamar', icon: Plus, to: '/admin?tab=kosts' },
    { id: 'tenants', label: 'Penyewa', icon: Users, to: '/admin?tab=tenants' },
    { id: 'complaints', label: 'Aduan Penyewa', icon: FileText, to: '/admin?tab=complaints' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/admin?tab=overview' },
    { id: 'finance', label: 'Keuangan', icon: CreditCard, to: '/admin?tab=overview' },
  ];

  const tenantItems: Item[] = [
    { id: 'profile', label: 'Profil', icon: User, to: '/tenant?tab=profile' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/tenant?tab=payments' },
    { id: 'complaints', label: 'Aduan', icon: FileText, to: '/tenant?tab=complaints' },
  ];

  const items = user?.role === 'admin' ? adminItems : tenantItems;

  const getActiveId = () => {
    const path = location.pathname || '/';
    const found = items.find((it) => it.to && path.startsWith(it.to));
    return found ? found.id : items[0].id;
  };

  const active = getActiveId();

  const handleClick = (it: Item) => {
    if (it.to) navigate(it.to);
  };

  return (
    <aside className="hidden md:flex flex-col w-56 bg-navy-900 text-white rounded-r-3xl overflow-hidden py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-accent-400 flex items-center justify-center mr-3">
            <span className="font-bold text-lg">E</span>
          </div>
          <div>
            <p className="font-bold text-sm">KOST</p>
            <p className="text-xs text-white/70">MANAGER</p>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="p-2 rounded-md hover:bg-white/10">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="mt-2 flex-1">
        <button
          onClick={() => navigate('/')}
          className={`w-full flex items-center justify-center mb-4 p-3 rounded-full bg-primary-800/0 hover:bg-white/5 transition-colors`}
        >
          <Home className="w-5 h-5" />
        </button>

        <div className="mt-2 px-2">
          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => handleClick(it)}
                className={`w-full mb-4 py-3 rounded-lg transition-all ${
                  isActive ? 'bg-yellow-400 text-navy-900 font-semibold' : 'bg-white text-navy-900/90'
                }`}
              >
                <span className="text-sm">{it.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
