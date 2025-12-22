import React from 'react';
import { Home, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';

interface TenantLayoutProps {
  children: React.ReactNode;
}

export const TenantLayout: React.FC<TenantLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      <div className="flex-1 md:ml-56 w-full">
        <header className="bg-white text-black border-b border-gray-200 sticky top-0 z-[100] shadow-sm">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4">
              {/* Left Side - Hamburger, Greeting, and Avatar */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <MobileMenu />
                <p className="text-xs sm:text-sm font-medium text-gray-700 leading-tight truncate">
                  Halo, <span className="font-semibold text-gray-900">{user?.name || 'User'}</span>
                </p>
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                  {user?.avatar_url && user.avatar_url.trim() !== '' && user.avatar_url !== 'null' ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user?.name || 'Profile'} 
                      className="w-full h-full object-cover"
                      key={user.avatar_url} // Force re-render when avatar changes
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const icon = parent.querySelector('.avatar-fallback-icon') as HTMLElement;
                          if (icon) icon.style.display = 'block';
                        }
                      }}
                      onLoad={() => {
                        const parent = document.querySelector('.avatar-fallback-icon')?.parentElement;
                        if (parent) {
                          const icon = parent.querySelector('.avatar-fallback-icon') as HTMLElement;
                          if (icon) icon.style.display = 'none';
                        }
                      }}
                    />
                  ) : null}
                  <User className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 avatar-fallback-icon ${user?.avatar_url && user.avatar_url.trim() !== '' && user.avatar_url !== 'null' ? 'hidden' : ''}`} />
                </div>
              </div>
              
              {/* Right Side - User Info and Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-xs sm:text-sm font-medium truncate max-w-[120px] md:max-w-none">{user?.name}</p>
                  <p className="text-xs text-gray-600">Penyewa</p>
                </div>
                <button
                  onClick={logout}
                  className="bg-accent-500 text-navy-900 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-accent-400 transition-colors text-xs sm:text-sm whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

