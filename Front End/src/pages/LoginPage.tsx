import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, CreditCard, LogIn, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    { name: "Budi", property: "Kos Mawar", text: "Pengalaman menggunakan E-Kost Manager sangat membantu! Fitur pembayaran digital dan pengaduan sangat praktis." },
    { name: "Suhartono", property: "Kos Mawar", text: "Platform yang sangat user-friendly. Mudah mengelola kost dan berkomunikasi dengan penyewa." },
    { name: "Ahmad", property: "Kos Mawar", text: "Sistem pembayaran terintegrasi sangat memudahkan transaksi bulanan. Highly recommended!" },
    { name: "Sarah", property: "Kos Mawar", text: "Interface yang clean dan mudah dipahami. Proses pembayaran jadi lebih cepat dan aman." },
    { name: "Rizki", property: "Kos Mawar", text: "Fitur pengaduan sangat membantu untuk komunikasi dengan pemilik kost. Responsif dan efisien." },
    { name: "Dewi", property: "Kos Melati", text: "Manajemen kost jadi lebih terstruktur. Dashboard admin sangat informatif dan mudah digunakan." },
    { name: "Fajar", property: "Kos Melati", text: "Pembayaran bulanan otomatis sangat memudahkan. Tidak perlu khawatir tentang keterlambatan lagi." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-navy-900 text-white overflow-x-hidden">
      {/* Fixed Top Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-navy-900/100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/img/logo.png" alt="Logo" className="h-14 w-auto rounded-md" />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-base text-white/80">
            <a className="hover:text-white transition-colors font-medium" href="#features">Beranda</a>
            <a className="hover:text-white transition-colors font-medium" href="#about">Tentang Kami</a>
            <a className="hover:text-white transition-colors font-medium" href="#contact">Hubungi Kami</a>
            <button onClick={() => navigate('/auth/login')} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-2.5 hover:bg-white/10 transition-colors text-base">
              <LogIn className="w-5 h-5" /> Log In
            </button>
            <button onClick={() => navigate('/auth/signup')} className="rounded-md bg-accent-500 text-navy-900 px-5 py-2.5 font-semibold hover:bg-accent-400 transition-colors text-base">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-md hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-navy-900/95 border-t border-white/10">
            <div className="px-4 py-5 space-y-5">
              <a className="block text-base text-white/80 hover:text-white transition-colors font-medium" href="#features">Beranda</a>
              <a className="block text-base text-white/80 hover:text-white transition-colors font-medium" href="#about">Tentang Kami</a>
              <a className="block text-base text-white/80 hover:text-white transition-colors font-medium" href="#contact">Hubungi Kami</a>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <button onClick={() => navigate('/auth/login')} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 px-4 py-3 hover:bg-white/10 transition-colors text-base">
                  <LogIn className="w-5 h-5" /> Log In
                </button>
                <button onClick={() => navigate('/auth/signup')} className="rounded-md bg-accent-500 text-navy-900 px-4 py-3 font-semibold hover:bg-accent-400 transition-colors text-base">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-yellow-400 font-semibold tracking-wide mb-3">Web Manajemen Kos & Properti</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                Kelola Kos Anda Lebih Mudah dan Untung.
                <span className="block text-yellow-400">Nikmati Kemudahan Digital!</span>
              </h1>
              <p className="text-white/80 mb-8 max-w-xl text-sm sm:text-base">
                Pantau penghuni, kelola keuangan, dan maksimalkan keuntungan, semua dalam satu genggaman.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate('/auth/login')} className="rounded-lg bg-yellow-400 text-navy-900 px-5 py-3 font-semibold hover:bg-yellow-300 transition-colors transform hover:scale-105">Mulai Sekarang</button>
                <a href="#features" className="rounded-lg border border-white/20 px-5 py-3 font-semibold hover:bg-white/10 transition-colors text-center transform hover:scale-105">Pelajari Fitur</a>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 aspect-video overflow-hidden">
              <img src="/img/kost-image.png" alt="Kost Image" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Fitur <span className="text-yellow-400">Unggulan</span>
            </h2>
            <p className="text-navy-200 text-lg">Solusi lengkap untuk manajemen kost modern</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 text-navy-900 mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Manajemen Kost</h3>
              <p className="text-navy-200 leading-relaxed">Kelola data kost, kamar, dan fasilitas dengan mudah melalui dashboard admin yang intuitif</p>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 text-navy-900 mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Dashboard Penyewa</h3>
              <p className="text-navy-200 leading-relaxed">Penyewa dapat melihat informasi kost, melakukan pembayaran, dan melaporkan masalah secara real-time</p>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20 sm:col-span-2 lg:col-span-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 text-navy-900 mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Pembayaran Digital</h3>
              <p className="text-navy-200 leading-relaxed">Sistem pembayaran terintegrasi untuk memudahkan transaksi sewa kost dengan aman dan cepat</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="bg-gradient-to-br from-white via-gray-50 to-white py-20 text-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tentang Kami
            </h2>
            <p className="text-gray-600 text-lg">Platform manajemen kost terpercaya</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Kami adalah tim yang terdiri dari mahasiswa aktif di Telkom University Purwokerto yang bersemangat dalam teknologi dan manajemen properti, didirikan di Purwokerto pada tahun 2025. Kami menciptakan platform E Kost Manager sebagai jawaban atas kebutuhan mendesak akan sistem pengelolaan kos yang terintegrasi dan user-friendly.
                </p>
                
                <div>
                  <h3 className="text-2xl font-bold text-navy-900 mb-6">Misi Kami:</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-navy-900 flex items-center justify-center flex-shrink-0 font-bold shadow-lg group-hover:scale-110 transition-transform">1</div>
                      <div className="group-hover:translate-x-1 transition-transform">
                        <h4 className="font-bold text-navy-900 mb-2">Memberdayakan Pemilik Kos</h4>
                        <p className="text-gray-600">Menyediakan platform yang membuat pengelolaan properti menjadi efisien, menghemat waktu, dan meningkatkan profitabilitas.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-navy-900 flex items-center justify-center flex-shrink-0 font-bold shadow-lg group-hover:scale-110 transition-transform">2</div>
                      <div className="group-hover:translate-x-1 transition-transform">
                        <h4 className="font-bold text-navy-900 mb-2">Meningkatkan Pengalaman Penyewa</h4>
                        <p className="text-gray-600">Menciptakan proses sewa-menyewa yang transparan, mudah, dan nyaman secara digital.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-navy-900 flex items-center justify-center flex-shrink-0 font-bold shadow-lg group-hover:scale-110 transition-transform">3</div>
                      <div className="group-hover:translate-x-1 transition-transform">
                        <h4 className="font-bold text-navy-900 mb-2">Menjadi Jantung Digital Kos di Purwokerto</h4>
                        <p className="text-gray-600">Berkontribusi pada ekosistem properti lokal dengan solusi teknologi terdepan.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-2xl transform rotate-3"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                <img src="/img/about-us.jpg" alt="Kost Image" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-navy-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-yellow-400">Testimoni</span> Pengguna
            </h2>
            <p className="text-navy-200 text-lg">Apa kata mereka tentang E-Kost Manager</p>
          </div>
          
          {/* Auto-scrolling Carousel */}
          <div className="relative overflow-hidden" ref={testimonialRef}>
            <div className="flex transition-transform duration-500 ease-in-out" 
                 style={{ transform: `translateX(-${currentTestimonialIndex * 100}%)` }}>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-200">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
                        <span className="text-navy-900 font-bold text-lg">{testimonial.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-bold text-navy-900 text-lg">{testimonial.name}</p>
                        <p className="text-gray-600">{testimonial.property}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed italic">"{testimonial.text}"</p>
                    <div className="flex mt-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Carousel Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              onClick={() => setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="p-2 rounded-full bg-navy-800 shadow-md hover:shadow-lg transition-shadow border border-navy-700"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentTestimonialIndex ? 'bg-yellow-400' : 'bg-navy-600'
                  }`}
                />
              ))}
            </div>
            
            <button 
              onClick={() => setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
              className="p-2 rounded-full bg-navy-800 shadow-md hover:shadow-lg transition-shadow border border-navy-700"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-gradient-to-br from-white via-gray-50 to-white py-20 text-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Hubungi Kami</h2>
            <p className="text-gray-600 text-lg">Kami siap membantu Anda</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">Informasi Kontak</h3>
                <div className="space-y-4">
                  <div className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-navy-400/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-navy-600 to-navy-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Email</p>
                      <p className="text-gray-600">support@ekostmanager.com</p>
                    </div>
                  </div>
                  <div className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-navy-400/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-navy-600 to-navy-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Telepon</p>
                      <p className="text-gray-600">+62 812 3456 7890</p>
                    </div>
                  </div>
                  <div className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-navy-400/50 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-navy-600 to-navy-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Alamat</p>
                      <p className="text-gray-600">Jakarta, Indonesia</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-navy-700 via-navy-800 to-navy-900 rounded-2xl p-8 text-white shadow-2xl">
                <h4 className="text-xl font-bold mb-6">Cara Bergabung:</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-navy-500 to-navy-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p className="group-hover:translate-x-1 transition-transform"><span className="font-semibold">Pemilik Kos:</span> Daftar melalui tombol Sign Up di atas</p>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-navy-500 to-navy-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p className="group-hover:translate-x-1 transition-transform"><span className="font-semibold">Penyewa:</span> Minta undangan dari pemilik kos Anda</p>
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm">
                      Sudah menerima undangan? <button onClick={() => navigate('/accept-invite')} className="text-navy-300 hover:text-navy-200 underline font-semibold transition-colors">Buka halaman pendaftaran</button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold mb-6">Kirim Pesan</h3>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                    <input 
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-all shadow-sm" 
                      placeholder="Masukkan nama lengkap Anda" 
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Aktif</label>
                    <input 
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-all shadow-sm" 
                      placeholder="email@example.com" 
                      type="email" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pesan Anda</label>
                    <textarea 
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 h-32 focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-all resize-none shadow-sm" 
                      placeholder="Tulis pesan Anda di sini..." 
                    />
                  </div>
                  <div>
                    <button className="w-full bg-gradient-to-r from-navy-600 to-navy-700 text-white px-6 py-4 font-semibold rounded-xl hover:from-navy-700 hover:to-navy-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                      Kirim Pesan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-navy-800 border-t border-white/10 text-white py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 text-center">
          <p className="text-white/60">© 2025 E-Kost Manager. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
};