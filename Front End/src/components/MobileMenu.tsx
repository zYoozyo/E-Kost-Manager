import React, { useState, useEffect } from 'react';
import { Menu, X, Home, User, Building2, Plus, CreditCard, Users, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Item = { id: string; label: string; icon: any; to?: string };

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent iOS bounce scroll
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Menu per role (excluding Dashboard which has separate button)
  const adminItems: Item[] = [
    { id: 'profile', label: 'Profil', icon: User, to: '/admin/profile' },
    { id: 'facilities', label: 'Fasilitas', icon: Building2, to: '/admin/facilities' },
    { id: 'tenants', label: 'Penyewa', icon: Users, to: '/admin/tenants' },
    { id: 'complaints', label: 'Aduan Penyewa', icon: FileText, to: '/admin/complaints' },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard, to: '/admin/payments' },
    { id: 'finance', label: 'Keuangan', icon: CreditCard, to: '/admin/finance' },
  ];

  const tenantItems: Item[] = [
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

  const handleLogoClick = () => {
    navigate('/');
    setIsOpen(false);
  };

  const handleHomeClick = () => {
    const role = user?.role === 'admin' ? 'admin' : 'tenant';
    navigate(`/${role}`);
    setIsOpen(false);
  };

  const handleClick = (it: Item) => {
    if (it.to) navigate(it.to);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Touch Friendly (min 44x44px) - Inline in header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden bg-navy-900 text-white p-2.5 min-w-[44px] min-h-[44px] rounded-lg hover:bg-navy-800 active:scale-95 transition-all duration-200 touch-manipulation flex items-center justify-center"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Menu Overlay with Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-[55] transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Mobile Menu Sidebar - Slide Animation */}
      <div
        className={`md:hidden fixed left-0 top-0 h-full w-[280px] sm:w-[320px] bg-navy-900 text-white shadow-2xl z-[60] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          willChange: 'transform',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Header with Logo Only */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-navy-700/50 bg-navy-800/50">
          <button
            onClick={handleLogoClick}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] active:opacity-70 transition-opacity hover:opacity-80"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <img 
              src="/img/logo.png" 
              alt="E-Kost Manager Logo" 
              className="w-20 h-20 sm:w-22 sm:h-22 object-contain"
              onError={(e) => {
                // Fallback jika logo tidak load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<span class="text-2xl sm:text-3xl font-bold text-white">🏠</span>';
                }
              }}
            />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="ml-2 p-2.5 min-w-[44px] min-h-[44px] rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors flex items-center justify-center touch-manipulation"
            aria-label="Close menu"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items - Scrollable */}
        <nav className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-3 space-y-2">
            {/* Dashboard Button */}
            <button
              onClick={handleHomeClick}
              className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg transition-all duration-200 active:scale-[0.98] ${
                (location.pathname === '/admin' || location.pathname === '/tenant')
                  ? 'bg-yellow-400 text-navy-900 font-semibold shadow-md'
                  : 'bg-white text-navy-900/90 hover:bg-yellow-50'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>

            {/* Menu Items */}
            {items.map((it) => {
              const isActive = active === it.id;
              const Icon = it.icon;

              return (
                <button
                  key={it.id}
                  onClick={() => handleClick(it)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-lg transition-all duration-200 active:scale-[0.98] ${
                    isActive
                      ? 'bg-yellow-400 text-navy-900 font-semibold shadow-md'
                      : 'bg-white text-navy-900/90 hover:bg-yellow-50'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{it.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

      </div>
    </>
  );
};

export default MobileMenu;
