import React, { useState, useEffect } from 'react';
import { 
  Home, 
  CreditCard, 
  AlertTriangle, 
  User, 
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const TenantDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    // Initialize AOS
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
      });
    };
    initAOS();
  }, []);

  // Mock data - replace with actual API calls
  const myKost = {
    name: 'Kost ABC',
    address: 'Jl. Merdeka No. 123, Jakarta',
    room: 'A-101',
    price: 1500000,
    facilities: ['AC', 'WiFi', 'Kamar Mandi Dalam', 'Dapur Bersama'],
    owner: 'Budi Santoso',
    phone: '081234567890'
  };

  const paymentHistory = [
    { id: 1, month: 'Januari 2024', amount: 1500000, status: 'paid', date: '2024-01-01', method: 'Transfer Bank' },
    { id: 2, month: 'Desember 2023', amount: 1500000, status: 'paid', date: '2023-12-01', method: 'Transfer Bank' },
    { id: 3, month: 'November 2023', amount: 1500000, status: 'paid', date: '2023-11-01', method: 'Transfer Bank' },
  ];

  const myComplaints = [
    { id: 1, title: 'AC Tidak Dingin', description: 'AC di kamar tidak dingin sejak kemarin', status: 'pending', priority: 'high', date: '2024-01-10' },
    { id: 2, title: 'WiFi Lambat', description: 'Koneksi WiFi sangat lambat di malam hari', status: 'in_progress', priority: 'medium', date: '2024-01-08' },
    { id: 3, title: 'Kebocoran Air', description: 'Ada kebocoran air di kamar mandi', status: 'resolved', priority: 'high', date: '2024-01-05' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <XCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy-900 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Home className="w-8 h-8 text-accent-400 mr-3" />
              <h1 className="text-2xl font-bold">E-Kost Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-white/70">Penyewa</p>
              </div>
              <button
                onClick={logout}
                className="bg-accent-500 text-navy-900 px-4 py-2 rounded-lg hover:bg-accent-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Kost Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8" data-aos="fade-up">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Informasi Kost Saya</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              <Eye className="w-4 h-4 inline mr-1" />
              Lihat Detail
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{myKost.name}</h3>
              <p className="text-gray-600 mb-2">{myKost.address}</p>
              <p className="text-sm text-gray-500">Kamar: {myKost.room}</p>
              <p className="text-sm text-gray-500">Pemilik: {myKost.owner}</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Sewa Bulanan:</span>
                <span className="text-lg font-semibold text-gray-900">
                  Rp {myKost.price.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Fasilitas:</span>
                <span className="text-sm text-gray-900">{myKost.facilities.length} item</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Kontak Pemilik:</span>
                <span className="text-sm text-primary-600">{myKost.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'payments', name: 'Pembayaran' },
                { id: 'complaints', name: 'Pengaduan' },
                { id: 'profile', name: 'Profil' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Payment Status */}
                <div data-aos="fade-up">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Pembayaran</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-green-900">Pembayaran Terbaru Lunas</h4>
                        <p className="text-sm text-green-700">Pembayaran untuk Januari 2024 telah diterima</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Payments */}
                <div data-aos="fade-up" data-aos-delay="200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Riwayat Pembayaran Terbaru</h3>
                    <button 
                      onClick={() => setActiveTab('payments')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Lihat Semua
                    </button>
                  </div>
                  <div className="space-y-3">
                    {paymentHistory.slice(0, 3).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{payment.month}</p>
                          <p className="text-sm text-gray-500">{payment.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">Rp {payment.amount.toLocaleString('id-ID')}</p>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1">{payment.status}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Complaints */}
                <div data-aos="fade-up" data-aos-delay="400">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pengaduan Terbaru</h3>
                    <button 
                      onClick={() => setActiveTab('complaints')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Lihat Semua
                    </button>
                  </div>
                  <div className="space-y-3">
                    {myComplaints.slice(0, 2).map((complaint) => (
                      <div key={complaint.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                          <div className="flex space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                        <p className="text-xs text-gray-500">{complaint.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div data-aos="fade-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Riwayat Pembayaran</h3>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Bayar Sekarang
                  </button>
                </div>
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{payment.month}</h4>
                          <p className="text-sm text-gray-500">{payment.method} • {payment.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">Rp {payment.amount.toLocaleString('id-ID')}</p>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1">{payment.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'complaints' && (
              <div data-aos="fade-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Pengaduan Saya</h3>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Buat Pengaduan
                  </button>
                </div>
                <div className="space-y-4">
                  {myComplaints.map((complaint) => (
                    <div key={complaint.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                            {complaint.priority}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">{complaint.date}</p>
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div data-aos="fade-up">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profil Saya</h3>
                <div className="max-w-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                      <input
                        type="tel"
                        value={user?.phone || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input
                        type="text"
                        value="Penyewa"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};