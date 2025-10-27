import React, { useState } from 'react';
import { Home, ArrowLeft, User, Building2, Plus, CreditCard, Users, FileText, Menu } from 'lucide-react';
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
    { id: 'profile', label: 'Profil', icon: User, to: '/admin?tab=overview' },
    { id: 'add-property', label: 'Tambah Properti', icon: Building2, to: '/admin?tab=kosts' },
    { id: 'add-room', label: 'Tambah Kamar', icon: Plus, to: '/admin?tab=kosts' },
    { id: 'tenants', label: 'Penyewa', icon: Users, to: '/admin?tab=tenants' },
    { id: 'complaints', label: 'Aduan Penyewa', icon: FileText, to: '/admin?tab=complaints' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/admin?tab=overview' },
    { id: 'finance', label: 'Keuangan', icon: CreditCard, to: '/admin?tab=overview' },
  ];

  const tenantItems: Item[] = [
    { id: 'overview', label: 'Beranda', icon: Home, to: '/tenant?tab=overview' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/tenant?tab=payments' },
    { id: 'complaints', label: 'Aduan', icon: FileText, to: '/tenant?tab=complaints' },
    { id: 'profile', label: 'Profil', icon: User, to: '/tenant?tab=profile' },
  ];

  const items = user?.role === 'admin' ? adminItems : tenantItems;

  const getActiveId = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    
    // If tab is specified in URL, use it
    if (tab) {
      const found = items.find((it) => it.id === tab);
      if (found) return found.id;
    }
    
    // Otherwise, use the first item by default
    return items[0].id;
  };

  const active = getActiveId();

  // Handle logo click - navigate to landing page
  const handleLogoClick = () => {
    navigate('/');
  };

  // Handle home icon click - go to overview/beranda
  const handleHomeClick = () => {
    const role = user?.role === 'admin' ? 'admin' : 'tenant';
    navigate(`/${role}?tab=overview`);
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleClick = (it: Item) => {
    if (it.to) navigate(it.to);
  };

  return (
    <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-20' : 'w-56'} bg-navy-900 text-white rounded-r-3xl overflow-hidden py-6 px-4 transition-all duration-300`}>
      {/* Header Section */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center relative' : 'justify-between'} mb-6`}>
        {isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-2 top-0 p-1 rounded-full bg-yellow-400 text-navy-900 hover:bg-yellow-300 transition-all duration-200 z-10"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={handleLogoClick}
          className={`flex items-center ${isCollapsed ? 'w-full justify-center' : ''}`}
        >
          <div className="w-12 h-12 rounded-full bg-accent-400 flex items-center justify-center mr-3 overflow-hidden">
            <img src="/img/logo.png" alt="Logo" className="h-12 w-12 object-cover" />
          </div>
          {!isCollapsed && (
            <div>
              <p className="font-bold text-sm">KOST</p>
              <p className="text-xs text-white/70">MANAGER</p>
            </div>
          )}
        </button>
        
        {!isCollapsed && (
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-md hover:bg-yellow-400/20 hover:text-yellow-400 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Home Icon */}
      {isCollapsed && (
        <button 
          onClick={handleHomeClick}
          className="w-full flex items-center justify-center mb-4 p-3 rounded-full bg-accent-400/20 hover:bg-yellow-400/30 transition-all duration-200"
        >
          <Home className="w-5 h-5 text-yellow-400" />
        </button>
      )}

      <nav className="mt-2 flex-1">
        {!isCollapsed && (
          <button
            onClick={handleHomeClick}
            className="w-full flex items-center justify-center mb-4 p-3 rounded-full bg-primary-800/0 hover:bg-yellow-400/20 hover:text-yellow-400 transition-all duration-200 group"
          >
            <Home className="w-5 h-5" />
          </button>
        )}

        <div className={`mt-2 ${isCollapsed ? 'px-0' : 'px-2'}`}>
          {items.map((it) => {
            const isActive = active === it.id;
            const Icon = it.icon;
            
            if (isCollapsed) {
              return (
                <button
                  key={it.id}
                  onClick={() => handleClick(it)}
                  className={`w-full mb-4 p-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    isActive 
                      ? 'bg-yellow-400 text-navy-900 shadow-md' 
                      : 'bg-white text-navy-900/90 hover:bg-yellow-50'
                  }`}
                  title={it.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            }
            
            return (
              <button
                key={it.id}
                onClick={() => handleClick(it)}
                className={`w-full mb-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-yellow-400 text-navy-900 font-semibold shadow-md' 
                    : 'bg-white text-navy-900/90 hover:bg-yellow-50 hover:text-navy-900 hover:shadow-sm'
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
