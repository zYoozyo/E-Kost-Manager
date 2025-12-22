import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { ForgotPasswordResponse } from '../types';
import toast from 'react-hot-toast';

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      const response = await authService.forgotPassword(data.email);
      const typedResponse = response as ForgotPasswordResponse;
      
      if (typedResponse.success) {
        setEmailSent(true);
        setSentEmail(data.email);
        toast.success('Kode OTP telah dikirim ke email Anda');
        // Redirect to verify OTP page after 1 second
        setTimeout(() => {
          navigate(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
        }, 1000);
      } else {
        toast.error(typedResponse.message || 'Gagal mengirim email OTP');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      let errorMessage = 'Gagal mengirim email OTP. Silakan coba lagi.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Email tidak ditemukan. Pastikan email yang Anda masukkan sudah terdaftar.';
      } else if (error.response?.status === 422) {
        errorMessage = error.response?.data?.message || 'Format email tidak valid.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
      } else if (error.message === 'Network Error' || !error.response) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!sentEmail) return;
    
    try {
      setIsLoading(true);
      const response = await authService.forgotPassword(sentEmail);
      const typedResponse = response as ForgotPasswordResponse;
      
      if (typedResponse.success) {
        toast.success('Kode OTP baru telah dikirim ke email Anda');
      } else {
        toast.error(typedResponse.message || 'Gagal mengirim ulang OTP');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim ulang OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header */}
      <header className="bg-navy-900/80 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-14 sm:h-16 md:h-20 flex items-center">
          <button 
            onClick={() => navigate('/auth/login')} 
            className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-white/80 hover:text-white transition-colors font-medium min-h-[44px] touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Kembali ke Login</span>
            <span className="sm:hidden">Kembali</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="w-full max-w-md">
          <div className="bg-navy-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-5 sm:mb-6 md:mb-8">
              <div className="flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                <img 
                  src="/img/logo.png" 
                  alt="E-Kost Manager" 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                Lupa Password?
              </h1>
              <p className="text-white/70 text-xs sm:text-sm md:text-base">
                {emailSent 
                  ? 'Kode OTP telah dikirim ke email Anda' 
                  : 'Masukkan email Anda untuk mendapatkan kode OTP'}
              </p>
            </div>

            {!emailSent ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2 sm:mb-3">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email wajib diisi',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Format email tidak valid',
                        },
                      })}
                      className="w-full px-4 sm:px-5 py-3 sm:py-3.5 md:py-4 pl-11 sm:pl-12 border border-white/20 rounded-lg sm:rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-sm sm:text-base min-h-[48px] sm:min-h-[52px]"
                      placeholder="Masukkan email Anda"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                    <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-400 flex items-center gap-1.5 sm:gap-2">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{errors.email.message}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-4 sm:px-6 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[52px] md:min-h-[56px] text-sm sm:text-base touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    'Kirim Kode OTP'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-green-400 mb-1 sm:mb-2">
                        Email Terkirim!
                      </p>
                      <p className="text-xs sm:text-sm text-white/70 break-words">
                        Kode OTP 6 digit telah dikirim ke <strong className="break-all">{sentEmail}</strong>. 
                        Silakan cek kotak masuk atau folder spam Anda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/auth/verify-otp?email=${encodeURIComponent(sentEmail)}`)}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-colors min-h-[48px] sm:min-h-[52px] text-sm sm:text-base touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Lanjutkan ke Verifikasi OTP
                  </button>

                  <button
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] sm:min-h-[52px] text-sm sm:text-base touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Ulang OTP'
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setSentEmail('');
                    }}
                    className="w-full text-white/70 hover:text-white text-xs sm:text-sm transition-colors py-2 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Gunakan Email Lain
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;

