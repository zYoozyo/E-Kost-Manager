import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { ArrowLeft } from 'lucide-react';

export const AuthLoginPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize AOS
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
      });
    };
    initAOS();
  }, []);

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header - Responsive */}
      <header className="bg-navy-900/80 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-14 sm:h-16 md:h-20 flex items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-white/80 hover:text-white transition-colors font-medium min-h-[44px] touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="hidden sm:inline">Kembali ke Beranda</span>
            <span className="sm:hidden">Kembali</span>
          </button>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="w-full max-w-md">
          <div 
            className="bg-navy-800/50 backdrop-blur-lg rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10 shadow-2xl"
            data-aos="fade-up"
          >
            <div className="text-center mb-5 sm:mb-6 md:mb-8">
              <div className="flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                <img 
                  src="/img/logo.png" 
                  alt="E-Kost Manager" 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                Selamat Datang Kembali
              </h1>
              <p className="text-white/70 text-xs sm:text-sm md:text-base">
                Masuk ke akun E-Kost Manager Anda
              </p>
            </div>
            
            <LoginForm onSwitchToSignup={() => navigate('/auth/signup')} />
          </div>
        </div>
      </main>
    </div>
  );
};
