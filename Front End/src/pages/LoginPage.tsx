import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Shield, CreditCard, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
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
      {/* Top Nav */}
      <nav className="backdrop-blur bg-navy-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent-500 text-navy-900 font-extrabold">E</span>
            <span className="font-semibold">Kost Manager</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm text-white/80">
            <a className="hover:text-white" href="#features">Beranda</a>
            <a className="hover:text-white" href="#about">Tentang Kami</a>
            <a className="hover:text-white" href="#contact">Hubungi Kami</a>
            <button onClick={() => navigate('/auth/login')} className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10">
              <LogIn className="w-4 h-4" /> Log In
            </button>
            <button onClick={() => navigate('/auth/signup')} className="rounded-md bg-accent-500 text-navy-900 px-3 py-1.5 font-semibold hover:bg-accent-400">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div data-aos="fade-right">
              <p className="text-accent-400 font-semibold tracking-wide mb-3">Web Manajemen Kos & Properti</p>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                Kelola Kos Anda Lebih Mudah dan Untung.
                <span className="block text-accent-400">Nikmati Kemudahan Digital!</span>
              </h1>
              <p className="text-white/80 mb-8 max-w-xl">
                Pantau penghuni, kelola keuangan, dan maksimalkan keuntungan, semua dalam satu genggaman.
              </p>
              <div className="flex gap-3">
                <button onClick={() => navigate('/auth/login')} className="rounded-lg bg-accent-500 text-navy-900 px-5 py-3 font-semibold hover:bg-accent-400">Mulai Sekarang</button>
                <a href="#features" className="rounded-lg border border-white/20 px-5 py-3 font-semibold hover:bg-white/10">Pelajari Fitur</a>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 aspect-video" data-aos="fade-left" />
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="bg-navy-900/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10" data-aos="fade-up" data-aos-delay="100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-500/20 text-accent-400 mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Manajemen Kost</h3>
              <p className="text-white/70">Kelola data kost, kamar, dan fasilitas dengan mudah melalui dashboard admin</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10" data-aos="fade-up" data-aos-delay="200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-500/20 text-accent-400 mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Penyewa</h3>
              <p className="text-white/70">Penyewa dapat melihat informasi kost, melakukan pembayaran, dan melaporkan masalah</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10" data-aos="fade-up" data-aos-delay="300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-500/20 text-accent-400 mb-4">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pembayaran Digital</h3>
              <p className="text-white/70">Sistem pembayaran terintegrasi untuk memudahkan transaksi sewa kost</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="bg-white text-navy-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tentang Kami
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div data-aos="fade-right">
              <div className="space-y-4">
                <p className="text-gray-700">
                  E-Kost Manager adalah platform manajemen kost yang memudahkan pemilik dan penyewa dalam satu sistem terintegrasi.
                  Kami berkomitmen untuk memberikan solusi terbaik dalam mengelola properti kost dengan teknologi modern dan user-friendly.
                  Fokus kami adalah kemudahan penggunaan, transparansi pembayaran, dan efisiensi operasional properti untuk semua pengguna.
                </p>
              </div>
            </div>
            <div data-aos="fade-left" className="rounded-xl bg-navy-900/5 border border-navy-900/10 aspect-video" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-black mb-2">
              <span className="text-accent-400">Testimoni</span> Pengguna
            </h2>
            <p className="text-black/70">
              Kirim testimonimu <a href="#contact" className="text-blue-400 underline hover:text-blue-300">di sini</a>
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {[
              { name: "Budi", property: "Kos Mawar", text: "Pengalaman menggunakan E-Kost Manager sangat membantu! Fitur pembayaran digital dan pengaduan sangat praktis." },
              { name: "Suhartono", property: "Kos Mawar", text: "Platform yang sangat user-friendly. Mudah mengelola kost dan berkomunikasi dengan penyewa." },
              { name: "Ahmad", property: "Kos Mawar", text: "Sistem pembayaran terintegrasi sangat memudahkan transaksi bulanan. Highly recommended!" }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/5 border border-black/10 rounded-xl p-6" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center">
                    <span className="text-black/60 font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-black">{testimonial.name}</p>
                    <p className="text-black/60 text-sm">{testimonial.property}</p>
                  </div>
                </div>
                <p className="text-black/80 text-sm">{testimonial.text}</p>
              </div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: "Sarah", property: "Kos Mawar", text: "Interface yang clean dan mudah dipahami. Proses pembayaran jadi lebih cepat dan aman." },
              { name: "Rizki", property: "Kos Mawar", text: "Fitur pengaduan sangat membantu untuk komunikasi dengan pemilik kost. Responsif dan efisien." }
            ].map((testimonial, index) => (
              <div key={index + 3} className="bg-white/5 border border-black/10 rounded-xl p-6" data-aos="fade-up" data-aos-delay={(index + 3) * 100}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center">
                    <span className="text-black/60 font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-black">{testimonial.name}</p>
                    <p className="text-black/60 text-sm">{testimonial.property}</p>
                  </div>
                </div>
                <p className="text-black/80 text-sm">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-white text-navy-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div data-aos="fade-right">
              <h3 className="text-2xl font-bold mb-4">Hubungi Kami</h3>
              <div className="space-y-4 text-gray-700">
                <p><strong>Email:</strong> support@ekostmanager.com</p>
                <p><strong>Telepon:</strong> +62 812 3456 7890</p>
                <p><strong>Alamat:</strong> Jakarta, Indonesia</p>
              </div>
              <div className="mt-6 h-40 rounded-xl bg-navy-900/5 border border-navy-900/10" />
            </div>
            <div data-aos="fade-left">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <input 
                    className="w-full rounded-md border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent" 
                    placeholder="Nama" 
                    type="text"
                  />
                </div>
                <div>
                  <input 
                    className="w-full rounded-md border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-accent-500 focus:border-transparent" 
                    placeholder="Email" 
                    type="email" 
                  />
                </div>
                <div>
                  <textarea 
                    className="w-full rounded-md border border-gray-300 px-4 py-3 h-32 focus:ring-2 focus:ring-accent-500 focus:border-transparent" 
                    placeholder="Pesan" 
                  />
                </div>
                <button className="w-full bg-accent-500 text-navy-900 px-5 py-3 font-semibold rounded-md hover:bg-accent-400 transition-colors">
                  Kirim
                </button>
              </form>
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  Untuk pemilik: daftar melalui tombol Sign Up. Untuk penyewa: minta undangan atau link dari pemilik Anda.
                </p>
                <p>
                  Jika Anda sudah menerima link undangan, buka <button onClick={() => navigate('/accept-invite')} className="text-primary-600 underline">halaman terima undangan</button> untuk menyelesaikan pendaftaran.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-navy-800 border-t border-white/10 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60">© 2025 E-Kost Manager. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
};