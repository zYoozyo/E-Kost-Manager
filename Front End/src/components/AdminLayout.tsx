import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import InviteTenant from './InviteTenant';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1">
        <header className="bg-navy-900 text-white border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-accent-400 mr-3" />
                <h1 className="text-2xl font-bold">E-Kost Manager</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-white/70">Pemilik Kost</p>
                </div>
                <button 
                  onClick={() => setShowInviteModal(true)} 
                  className="bg-white text-navy-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Invite Tenant
                </button>
                <button 
                  onClick={logout} 
                  className="bg-accent-500 text-navy-900 px-4 py-2 rounded-lg hover:bg-accent-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {showInviteModal && user && (
          <InviteTenant ownerId={user.id} onClose={() => setShowInviteModal(false)} />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

