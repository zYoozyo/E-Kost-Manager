import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Key, AlertCircle, Loader2, Mail } from 'lucide-react';
import { authService } from '../services/authService';
import { ForgotPasswordResponse } from '../types';
import toast from 'react-hot-toast';

interface VerifyOTPFormData {
  otp: string;
}

export const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<VerifyOTPFormData>();

  useEffect(() => {
    if (!email) {
      toast.error('Email tidak ditemukan');
      navigate('/auth/forgot-password');
      return;
    }
    // Focus on OTP input when component mounts
    setFocus('otp');
  }, [email, navigate, setFocus]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: VerifyOTPFormData) => {
    try {
      setIsLoading(true);
      const response = await authService.verifyOTP(email, data.otp);
      
      if (response.success) {
        setOtpVerified(true);
        toast.success('Kode OTP berhasil diverifikasi!');
        
        // Redirect to reset password page after 1 second
        setTimeout(() => {
          navigate(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(data.otp)}`);
        }, 1000);
      } else {
        toast.error(response.message || 'Kode OTP tidak valid');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      let errorMessage = 'Kode OTP tidak valid. Silakan coba lagi.';
      
      if (error.response?.status === 422) {
        errorMessage = error.response?.data?.message || 'Kode OTP tidak valid atau sudah kadaluarsa.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Email tidak ditemukan. Silakan ulangi proses lupa password.';
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
    if (countdown > 0) return;
    
    try {
      setIsResending(true);
      const response = await authService.forgotPassword(email);
      const typedResponse = response as ForgotPasswordResponse;
      
      if (typedResponse.success) {
        toast.success('Kode OTP baru telah dikirim ke email Anda');
        setCountdown(60); // 60 seconds countdown
      } else {
        toast.error(typedResponse.message || 'Gagal mengirim ulang OTP');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim ulang OTP');
    } finally {
      setIsResending(false);
    }
  };

  if (otpVerified) {
    return (
      <div className="min-h-screen bg-navy-900 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-navy-800/50 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Key className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
              OTP Terverifikasi!
            </h1>
            <p className="text-white/70 text-sm sm:text-base mb-4 sm:mb-6">
              Mengalihkan ke halaman reset password...
            </p>
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto text-yellow-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header */}
      <header className="bg-navy-900/80 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-14 sm:h-16 md:h-20 flex items-center">
          <button 
            onClick={() => navigate('/auth/forgot-password')} 
            className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-white/80 hover:text-white transition-colors font-medium min-h-[44px] touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Kembali</span>
            <span className="sm:hidden">Kembali</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="w-full max-w-md">
          <div className="bg-navy-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-5 sm:mb-6 md:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 shadow-lg">
                <Key className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-navy-900" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                Verifikasi OTP
              </h1>
              <p className="text-white/70 text-xs sm:text-sm md:text-base mb-2">
                Masukkan kode OTP 6 digit yang telah dikirim ke
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs sm:text-sm md:text-base font-medium">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="break-all">{email}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2 sm:mb-3">
                  Kode OTP
                </label>
                <input
                  type="text"
                  {...register('otp', {
                    required: 'Kode OTP wajib diisi',
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: 'Kode OTP harus 6 digit angka',
                    },
                  })}
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 md:py-4 border border-white/20 rounded-lg sm:rounded-xl bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-center text-xl sm:text-2xl md:text-3xl tracking-[0.5em] font-mono min-h-[56px] sm:min-h-[60px] md:min-h-[64px]"
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
                {errors.otp && (
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-400 flex items-center gap-1.5 sm:gap-2">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{errors.otp.message}</span>
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
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  'Verifikasi OTP'
                )}
              </button>

              <div className="pt-2 sm:pt-3 border-t border-white/10">
                <p className="text-center text-xs sm:text-sm text-white/60 mb-3 sm:mb-4">
                  Tidak menerima kode OTP?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending || countdown > 0}
                  className="w-full bg-white/10 hover:bg-white/20 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-[48px] text-xs sm:text-sm touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : countdown > 0 ? (
                    <span>Kirim Ulang ({countdown}s)</span>
                  ) : (
                    'Kirim Ulang OTP'
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('/auth/forgot-password')}
                className="w-full text-white/70 hover:text-white text-xs sm:text-sm transition-colors py-2 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Gunakan Email Lain
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOTPPage;

