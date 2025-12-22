import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { invitationService } from '../services/invitationService';

export const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get token from URL params (support both ?token=xxx and #token=xxx)
  const tokenFromQuery = searchParams.get('token') || '';
  const tokenFromHash = new URLSearchParams(window.location.hash.substring(1)).get('token') || '';
  const token = tokenFromQuery || tokenFromHash;
  
  console.log('AcceptInvitePage - Full URL:', window.location.href);
  console.log('AcceptInvitePage - Pathname:', window.location.pathname);
  console.log('AcceptInvitePage - Search:', window.location.search);
  console.log('AcceptInvitePage - Hash:', window.location.hash);
  console.log('AcceptInvitePage - Token from query:', tokenFromQuery);
  console.log('AcceptInvitePage - Token from hash:', tokenFromHash);
  console.log('AcceptInvitePage - Final token:', token);
  console.log('AcceptInvitePage - All search params:', Object.fromEntries(searchParams.entries()));

  const [invitation, setInvitation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AcceptInvitePage - useEffect triggered, token:', token);
    
    if (!token) {
      console.error('AcceptInvitePage - No token found in URL');
      setError('Token undangan tidak ditemukan. Pastikan link undangan lengkap.');
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      console.log('AcceptInvitePage - Validating token:', token);
      setLoading(true);
      setError('');
      
      const response = await invitationService.validateToken(token);
      console.log('AcceptInvitePage - Validation response:', response);
      
      if (response.success) {
        setInvitation(response.data);
        console.log('AcceptInvitePage - Invitation data:', response.data);
      } else {
        const errorMsg = response.message || 'Undangan tidak valid';
        console.error('AcceptInvitePage - Validation failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('AcceptInvitePage - Validation error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Undangan tidak valid atau sudah kedaluwarsa';
      setError(errorMsg);
      toast.error(errorMsg, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');

    // Validations
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setSubmitting(true);

    try {
      const response = await invitationService.acceptInvitation({
        token,
        password,
        password_confirmation: confirmPassword,
      });

      console.log('Invitation accepted successfully:', response);
      
      toast.success('Akun berhasil dibuat! Mengalihkan ke halaman login...', {
        duration: 3000,
      });
      
      // Redirect ke halaman login dengan email yang sudah diisi
      setTimeout(() => {
        const email = invitation?.invitation?.email || response.data?.user?.email;
        console.log('Redirecting to login with email:', email);
        navigate('/auth/login', { 
          state: { 
            email: email,
            message: 'Akun Anda berhasil dibuat. Silakan login dengan email dan password yang baru saja Anda buat.'
          } 
        });
      }, 2000);

    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Gagal membuat akun. Silakan coba lagi.';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memvalidasi undangan...</p>
        </div>
      </div>
    );
  }

  if (!invitation || error) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Undangan Tidak Valid</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Token undangan tidak ditemukan atau sudah kedaluwarsa.'}
          </p>
          {!token && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Tips:</strong>
              </p>
              <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                <li>Pastikan Anda mengklik link lengkap dari email undangan</li>
                <li>Link harus berformat: <code className="bg-yellow-100 px-1 rounded">/accept-invite?token=...</code></li>
                <li>Jika link tidak lengkap, salin seluruh link dari email dan buka di browser</li>
              </ul>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth/login')}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Kembali ke Halaman Login
            </button>
            {token && (
              <button
                onClick={() => {
                  setError('');
                  setLoading(true);
                  validateToken();
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Coba Lagi
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Terima Undangan</h2>
          <p className="text-gray-600">
            Anda diundang oleh <strong>{invitation.owner_name}</strong> untuk bergabung di{' '}
            <strong>{invitation.kost_name}</strong>
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Email:</strong> {invitation.invitation.email}
          </p>
          {invitation.invitation.name && (
            <p className="text-sm text-blue-800 mt-1">
              <strong>Nama:</strong> {invitation.invitation.name}
            </p>
          )}
        </div>

        {/* Password Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="Masukkan password yang sama"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              'Selesaikan Pendaftaran'
            )}
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-6">
          Dengan melanjutkan, Anda menyetujui syarat dan ketentuan yang berlaku
        </p>
      </div>
    </div>
  );
};

export default AcceptInvitePage;