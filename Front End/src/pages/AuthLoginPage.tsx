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
      <header className="bg-navy-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-24 flex items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-white/80 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Kembali ke Beranda</span>
            <span className="sm:hidden">Kembali</span>
          </button>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <main className="flex-1 flex items-center justify-center py-8 md:py-12 px-4">
        <div className="w-full max-w-md">
          <div 
            className="bg-navy-800/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl"
            data-aos="fade-up"
          >
            <div className="text-center mb-6 md:mb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
                <img 
                  src="/img/logo.png" 
                  alt="E-Kost Manager" 
                  className="w-10 h-10 md:w-12 md:h-12 object-contain filter brightness-0 invert"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Selamat Datang Kembali
              </h1>
              <p className="text-white/70 text-sm md:text-base">
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
