import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ProfileSection } from '../../components/ProfileSection';
import { OwnerPaymentSettingsSection } from '../../components/OwnerPaymentSettingsSection';
import { useAuth } from '../../contexts/AuthContext';

export const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <div>
        {user && (
          <>
            <ProfileSection
              user={user}
              onUpdate={(updatedUser) => {
                // Update handled by ProfileSection via useAuth
              }}
            />

            {user.role === 'admin' && <OwnerPaymentSettingsSection />}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

