import React, { useState } from 'react';
import { Home, ArrowLeft, ArrowRight, User, Building2, Plus, CreditCard, Users, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Item = { id: string; label: string; icon: any; to?: string };

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Menu per role
  // map admin items to existing admin dashboard tabs where possible
  const adminItems: Item[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, to: '/admin' },
    { id: 'facilities', label: 'Fasilitas', icon: Building2, to: '/admin/facilities' },
    { id: 'tenants', label: 'Penyewa', icon: Users, to: '/admin/tenants' },
    { id: 'complaints', label: 'Aduan Penyewa', icon: FileText, to: '/admin/complaints' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/admin/payments' },
    { id: 'finance', label: 'Keuangan', icon: CreditCard, to: '/admin/finance' },
    { id: 'profile', label: 'Profil', icon: User, to: '/admin/profile' },
  ];

  const tenantItems: Item[] = [
    { id: 'overview', label: 'Dashboard', icon: Home, to: '/tenant' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/tenant/payments' },
    { id: 'complaints', label: 'Aduan', icon: FileText, to: '/tenant/complaints' },
    { id: 'profile', label: 'Profil', icon: User, to: '/tenant/profile' },
  ];

  const items = user?.role === 'admin' ? adminItems : tenantItems;

  const getActiveId = () => {
    const currentPath = location.pathname;

    // 1) Exact match to item.to (prioritize exact match)
    const exact = items.find((it) => it.to === currentPath);
    if (exact) return exact.id;

    // 2) Root dashboard routes (only if exact path matches)
    if (currentPath === '/admin' && user?.role === 'admin') {
      return 'dashboard';
    }
    if (currentPath === '/tenant' && user?.role === 'tenant') {
      return 'overview';
    }

    // 3) No match found - return undefined (no active item)
    return undefined;
  };

  const active = getActiveId();

  // Handle logo click - navigate to appropriate dashboard
  const handleLogoClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'tenant') {
      navigate('/tenant');
    } else {
      navigate('/');
    }
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleClick = (it: Item) => {
    if (it.to) navigate(it.to);
  };

  return (
    <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-20' : 'w-56'} bg-navy-900 text-white rounded-r-2xl sm:rounded-r-3xl overflow-hidden py-4 sm:py-6 px-3 sm:px-4 transition-all duration-300 h-full shadow-lg`}>
      {/* Header Section */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'} mb-4 sm:mb-6`}>
        {isCollapsed ? (
          // Saat collapsed: hanya tampilkan tombol arrow untuk expand
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-white text-navy-900 hover:bg-yellow-50 transition-all duration-200 flex items-center justify-center min-w-[44px] min-h-[44px]"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          // Saat expanded: tampilkan logo dan tombol arrow untuk collapse
          <>
            <button
              onClick={handleLogoClick}
              className="flex items-center flex-1 justify-center group transition-all duration-200 hover:opacity-80"
            >
              <img 
                src="/img/logo.png" 
                alt="E-Kost Manager Logo" 
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                onError={(e) => {
                  // Fallback jika logo tidak load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-3xl sm:text-4xl font-bold text-white">🏠</span>';
                  }
                }}
              />
            </button>
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-md hover:bg-yellow-400/20 hover:text-yellow-400 transition-all duration-200 flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto">
        <div className={`mt-2 ${isCollapsed ? 'px-0' : 'px-1 sm:px-2'}`}>
          {items.map((it) => {
            const isActive = active === it.id;
            const Icon = it.icon;
            
            if (isCollapsed) {
              return (
                <button
                  key={it.id}
                  onClick={() => handleClick(it)}
                  className={`w-full mb-2 sm:mb-3 p-2.5 sm:p-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    isActive 
                      ? 'bg-yellow-400 text-navy-900 shadow-md' 
                      : 'bg-white text-navy-900/90 hover:bg-yellow-50'
                  }`}
                  title={it.label}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              );
            }
            
            return (
              <button
                key={it.id}
                onClick={() => handleClick(it)}
                className={`w-full mb-2 sm:mb-3 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 text-left flex items-center gap-3 ${
                  isActive 
                    ? 'bg-yellow-400 text-navy-900 font-semibold shadow-md' 
                    : 'bg-white text-navy-900/90 hover:bg-yellow-50 hover:text-navy-900 hover:shadow-sm'
                }`}
              >
                <it.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{it.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
