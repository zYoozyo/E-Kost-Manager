import React, { useEffect, useState } from 'react';
import { Edit, User as UserIcon, X } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ProfileSectionProps {
  user: User;
  onUpdate?: (updatedUser: User) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onUpdate }) => {
  const { setUser: setAuthUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    email: user.email || '',
    whatsapp: user.whatsapp || user.phone || '',
    address: user.address || '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updateData: any = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        whatsapp: formData.whatsapp,
        address: formData.address,
      };

      if (formData.password) {
        updateData.password = formData.password;
        updateData.password_confirmation = formData.password;
      }

      const updatedUser = await authService.updateProfile(updateData);
      // Update AuthContext agar semua komponen terupdate (termasuk header avatar)
      setAuthUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdate) {
        onUpdate(updatedUser);
      }
      setIsEditing(false);
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      whatsapp: user.whatsapp || user.phone || '',
      address: user.address || '',
      password: '',
    });
    setIsEditing(false);
  };

const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();

    formData.append('avatar', file);

    try {
      const updatedUser = await authService.updateProfile(formData);
      
      console.log('Updated user from API:', updatedUser);
      console.log('Avatar (raw path):', updatedUser.avatar);
      console.log('Avatar URL (use this):', updatedUser.avatar_url);
      
      // Pastikan avatar_url ada - jika tidak ada, fetch ulang dari backend
      if (!updatedUser.avatar_url && updatedUser.avatar) {
        console.warn('⚠️ avatar_url missing, fetching profile again...');
        try {
          const refreshedUser = await authService.getProfile();
          updatedUser.avatar_url = refreshedUser.avatar_url;
          console.log('Refreshed avatar URL:', refreshedUser.avatar_url);
        } catch (err) {
          console.error('Failed to refresh profile:', err);
        }
      }

      // Tambahkan timestamp untuk bypass browser cache
      if (updatedUser.avatar_url) {
        const separator = updatedUser.avatar_url.includes('?') ? '&' : '?';
        updatedUser.avatar_url = `${updatedUser.avatar_url}${separator}t=${Date.now()}`;
      }

      // Update AuthContext agar semua komponen terupdate (termasuk header avatar)
      setAuthUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdate) {
        onUpdate(updatedUser);
      }
      toast.success('Foto profil berhasil diperbarui');
      setIsEditingPhoto(false);

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload foto');
    }
  };

  useEffect(() => {
    console.log('ProfileSection - User updated:', user);
    console.log('ProfileSection - Avatar (raw):', user.avatar);
    console.log('ProfileSection - Avatar URL:', user.avatar_url);
    // Pastikan kita hanya menggunakan avatar_url, bukan avatar
    if (user.avatar && !user.avatar_url) {
      console.warn('⚠️ Avatar exists but avatar_url is missing!');
    }
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      whatsapp: user.whatsapp || user.phone || '',
      address: user.address || '',
      password: '',
    });
  }, [user]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Profil Saya</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium text-sm sm:text-base min-h-[44px] touch-manipulation shadow-sm"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Edit Profil
            </button>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors font-medium text-sm sm:text-base min-h-[44px] touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium text-sm sm:text-base min-h-[44px] touch-manipulation shadow-sm"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Simpan
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        {/* Profile Picture - Mobile: Top, Desktop: Right */}
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center w-full md:w-auto md:flex-shrink-0">
            <div className="relative mb-4 md:mb-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg ring-4 ring-blue-50 relative">
                {user.avatar_url && user.avatar_url.trim() !== '' && user.avatar_url !== 'null' ? (
                  <img 
                    src={user.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    key={user.avatar_url} // Force re-render when avatar changes
                    onError={(e) => {
                      // Jika gambar gagal load, sembunyikan gambar
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const icon = parent.querySelector('.profile-avatar-fallback') as HTMLElement;
                        if (icon) icon.style.display = 'block';
                      }
                    }}
                    onLoad={() => {
                      const parent = document.querySelector('.profile-avatar-fallback')?.parentElement;
                      if (parent) {
                        const icon = parent.querySelector('.profile-avatar-fallback') as HTMLElement;
                        if (icon) icon.style.display = 'none';
                      }
                    }}
                  />
                ) : null}
                <UserIcon 
                  className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-gray-400 absolute profile-avatar-fallback ${user.avatar_url && user.avatar_url.trim() !== '' && user.avatar_url !== 'null' ? 'hidden' : ''}`}
                />
              </div>
              <button
                onClick={() => setIsEditingPhoto(true)}
                className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 bg-blue-500 text-white p-2.5 sm:p-3 rounded-full hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ring-2 ring-white"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {isEditingPhoto && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center gap-3 z-10">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="bg-blue-500 text-white px-4 py-2.5 rounded-lg cursor-pointer hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium text-sm min-h-[44px] flex items-center justify-center touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Pilih Foto
                  </label>
                  <button
                    onClick={() => setIsEditingPhoto(false)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 active:bg-red-700 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {!isEditing && (
              <p className="text-xs sm:text-sm text-gray-500 text-center mt-2 md:hidden">
                Ketuk ikon edit untuk mengubah foto
              </p>
            )}
          </div>

          {/* Profile Details Section */}
          <div className="flex-1 w-full space-y-4 sm:space-y-5 md:space-y-6">
            {/* Mobile: Card-style layout, Desktop: Row layout */}
            <div className="space-y-4 sm:space-y-5">
              {/* Nama */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">
                  Nama
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white min-h-[44px]"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-semibold text-gray-900 break-words mt-1">{user.name || '-'}</p>
                )}
              </div>

              {/* Username */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white min-h-[44px]"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-semibold text-gray-900 break-words mt-1">{user.username || '-'}</p>
                )}
              </div>

              {/* Email */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white min-h-[44px]"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-semibold text-gray-900 break-words mt-1">{user.email || '-'}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">
                  Nomor WhatsApp
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+62 812 345 6789"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white min-h-[44px]"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-semibold text-gray-900 break-words mt-1">{user.whatsapp || user.phone || '-'}</p>
                )}
              </div>

              {/* Alamat */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                <label className="block text-xs sm:text-sm font-semibold text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">
                  Alamat
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white resize-none min-h-[100px]"
                  />
                ) : (
                  <p className="text-sm sm:text-base font-semibold text-gray-900 whitespace-pre-line break-words mt-1">{user.address || '-'}</p>
                )}
              </div>

              {/* Password (only when editing) */}
              {isEditing && (
                <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200">
                  <label className="block text-xs sm:text-sm font-semibold text-blue-700 mb-1.5 sm:mb-2 uppercase tracking-wide">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white min-h-[44px] placeholder:text-gray-400"
                  />
                  <p className="text-xs text-blue-600 mt-1.5">Biarkan kosong jika tidak ingin mengubah password</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

