import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupForm } from '../components/SignupForm';
import { ArrowLeft } from 'lucide-react';

export const AuthSignupPage: React.FC = () => {
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
      {/* Header */}
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

      {/* Auth Section */}
      <section className="py-6 sm:py-8 md:py-12 lg:py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="max-w-md mx-auto">
            <SignupForm onSwitchToLogin={() => navigate('/auth/login')} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-800 border-t border-white/10 text-white py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
          <p className="text-white/60 text-xs sm:text-sm">© 2025 E-Kost Manager. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
};
