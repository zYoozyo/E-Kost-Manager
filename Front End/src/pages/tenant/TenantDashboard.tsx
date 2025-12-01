import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, Users, CreditCard, AlertTriangle, Plus, Search, Filter, Eye, User, CheckCircle, Clock, XCircle, ArrowRight, ChevronRight, Calendar, FileText, TrendingUp, TrendingDown, DollarSign, Bell, Menu, X, MessageSquare, ChevronDown } from 'lucide-react';
import { roomService, TenantRoomResponse } from '../../services/roomService';
import { paymentService, PaymentHistoryItem } from '../../services/paymentService';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { TenantLayout } from '../../components/TenantLayout';
import { useNotifications } from '../../hooks/useNotifications';

export const TenantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount, notifications } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [tenantRoom, setTenantRoom] = useState<TenantRoomResponse | null>(null);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate analytics
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.nominal_tagihan, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.nominal_tagihan, 0);
  const paymentTrend = payments.length > 1 ? 
    (payments.filter(p => p.status === 'paid').length / payments.length) * 100 : 0;

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);

        const [roomData, paymentData, complaintData] = await Promise.all([
          roomService.getTenantRoom(),
          paymentService.getPaymentHistory(),
          complaintService.getTenantComplaints(),
        ]);

        setTenantRoom(roomData);
        setPayments(paymentData ?? []);
        setComplaints(complaintData ?? []);
      } catch (err: any) {
        console.error('Failed to load tenant dashboard data', err);
        setError(err?.response?.data?.message || 'Gagal memuat data dashboard penyewa');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const kostName = tenantRoom?.kost?.nama_kost || 'Kost Anda';
  const kostAddress = tenantRoom?.kost?.alamat_kost || 'Alamat kost belum diisi';
  const roomNumber = tenantRoom?.room?.nomor_kamar || '-';
  const monthlyPrice = tenantRoom?.room?.harga_sewa ?? tenantRoom?.kost?.harga ?? 0;
  const ownerName = tenantRoom?.owner?.name || '-';
  const ownerContact = tenantRoom?.owner?.phone || tenantRoom?.owner?.whatsapp || '-';

  const recentPayments = payments.slice(0, 3);

  // Calculate due date properly for each payment
  const getPaymentDueDate = (payment: PaymentHistoryItem) => {
    const startDate = new Date(payment.periode_mulai);
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + 30); // Add exactly 30 days (1 month)
    return dueDate;
  };
  const recentComplaints = complaints.slice(0, 2);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <TenantLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      {/* Show skeleton loading only for data sections, not full page */}
        {isLoading && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="md:col-span-2 bg-gray-100 rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section - Only show when not loading */}
        {!isLoading && (
          <>
            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center mb-6">
              {/* Mobile Logo */}
              <button 
                onClick={() => navigate('/tenant')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
                  <p className="text-xs text-gray-600">Selamat datang, {user?.name}</p>
                </div>
              </button>
              
              <div className="flex items-center gap-2">
                {/* Mobile Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => navigate('/tenant/notifications')}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-center mb-6">
              {/* Logo and Title with Hover Effects */}
              <button 
                onClick={() => navigate('/tenant')}
                className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="p-3 bg-blue-500 rounded-lg group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Dashboard</h2>
                  <p className="text-sm text-gray-600">Selamat datang kembali, {user?.name}</p>
                </div>
              </button>
              
              {/* Profile Section */}
              <div className="flex items-center gap-3">
                {/* Notification Button */}
                <div className="relative">
                  <button 
                    onClick={() => navigate('/tenant/notifications')}
                    className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name || 'Profil'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={() => {
                          navigate('/tenant/profile');
                          setIsProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profil Saya
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
                <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <nav className="p-4 space-y-2">
                    <button
                      onClick={() => {
                        navigate('/tenant/payments');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-3"
                    >
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span>Pembayaran</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/tenant/complaints');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-3"
                    >
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span>Aduan</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/tenant/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-3"
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span>Profil</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 flex items-center gap-3 text-red-600"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Keluar</span>
                    </button>
                  </nav>
                </div>
              </div>
            )}

            {/* Analytics Cards - Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                  <span className="text-xs md:text-sm text-green-600 font-semibold">+12%</span>
                </div>
                <p className="text-lg md:text-2xl font-bold text-gray-900">Rp {totalPaid.toLocaleString('id-ID')}</p>
                <p className="text-xs md:text-sm text-gray-600">Total Dibayar</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                  <span className="text-xs md:text-sm text-yellow-600 font-semibold">Pending</span>
                </div>
                <p className="text-lg md:text-2xl font-bold text-gray-900">Rp {totalPending.toLocaleString('id-ID')}</p>
                <p className="text-xs md:text-sm text-gray-600">Menunggu Pembayaran</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                  <span className="text-xs md:text-sm text-blue-600 font-semibold">{paymentTrend.toFixed(0)}%</span>
                </div>
                <p className="text-lg md:text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'paid').length}</p>
                <p className="text-xs md:text-sm text-gray-600">Pembayaran Sukses</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                  <span className="text-xs md:text-sm text-purple-600 font-semibold">Active</span>
                </div>
              </div>
            </div>

            {/* Welcome & Room Cards - Responsive */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Welcome Card */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 flex items-center justify-center mr-3 md:mr-4">
                    <User className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900">Selamat Datang</h2>
                    <p className="text-sm md:text-lg font-semibold text-gray-900">{user?.name}</p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  {tenantRoom ? `Terima kasih sudah menjadi bagian dari ${tenantRoom.kost?.nama_kost || 'Kost'}` : 'Menunggu konfirmasi kamar dari pemilik'}
                </p>
              </div>

              {/* Room Card - Full Width on Mobile */}
              <div className="md:col-span-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-4 md:p-6">
                <div className="mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-navy-900 mb-1">{kostName}</h3>
                  <p className="text-2xl md:text-4xl font-bold text-navy-900">{roomNumber}</p>
                </div>
                <div className="flex items-center justify-between mt-4 md:mt-6">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-navy-900">Harga: Rp {monthlyPrice.toLocaleString('id-ID')}/bulan</p>
                  </div>
                  <Home className="w-6 h-6 md:w-8 md:h-8 text-navy-900" />
                </div>
              </div>
            </div>

            {/* My Kost Info - Responsive */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Informasi Kost Saya</h2>
                <button 
                  onClick={() => navigate('/tenant/payments')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium self-start"
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Lihat Detail
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">{kostName}</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-2">{kostAddress}</p>
                  <p className="text-xs md:text-sm text-gray-500">Kamar: {roomNumber}</p>
                  <p className="text-xs md:text-sm text-gray-500">Pemilik: {ownerName}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs md:text-sm text-gray-600">Sewa Bulanan:</span>
                    <span className="text-sm md:text-lg font-semibold text-gray-900">Rp {monthlyPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs md:text-sm text-gray-600">Tipe Kamar:</span>
                    <span className="text-xs md:text-sm text-gray-900">{tenantRoom?.room?.tipe_kamar || 'Standar'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-gray-600">Kontak Pemilik:</span>
                    <span className="text-xs md:text-sm text-primary-600">{ownerContact}</span>
                  </div>
                </div>
              </div>
            </div>

{/* Dashboard Content */}
            <div className="space-y-8">
              {/* Payment Status - Enhanced */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Status Pembayaran</h3>
                  <button 
                    onClick={() => navigate('/tenant/payments')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Lihat Semua
                  </button>
                </div>
                
                {tenantRoom ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-green-900">Kamar Aktif</h4>
                          <p className="text-sm text-green-700">Anda terdaftar di {tenantRoom.kost?.nama_kost || 'Kost'}</p>
                        </div>
                      </div>
                      
                      {/* Next Payment Info */}
                      {recentPayments.length > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-green-600">Tagihan Berikutnya</p>
                          <p className="text-sm font-semibold text-green-900">
                            {recentPayments[0].status === 'paid' ? 'Lunas' : `Rp ${recentPayments[0].nominal_tagihan.toLocaleString('id-ID')}`}
                          </p>
                          {recentPayments[0].status === 'pending' && (
                            <p className="text-xs text-green-700">
                              {(() => {
                                const dueDate = getPaymentDueDate(recentPayments[0]);
                                const today = new Date();
                                const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                return daysUntil <= 7 ? `${daysUntil} hari lagi` : dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                              })()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-6 h-6 text-yellow-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Menunggu Konfirmasi</h4>
                        <p className="text-sm text-yellow-700">Pemilik akan menetapkan kamar untuk Anda</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Payments */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pembayaran Terbaru</h3>
                  <button 
                    onClick={() => navigate('/tenant/payments')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  >
                    Lihat Semua <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                
                {recentPayments.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3 p-4">
                      {recentPayments.map((payment) => (
                        <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {new Date(payment.periode_mulai).toLocaleDateString('id-ID', {
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Mulai: {new Date(payment.periode_mulai).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                              {payment.status === 'paid' ? 'Lunas' : payment.status === 'pending' ? 'Menunggu' : payment.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                Rp {payment.nominal_tagihan.toLocaleString('id-ID')}
                              </p>
                              <p className="text-xs text-gray-500">
                                Jatuh tempo: {getPaymentDueDate(payment).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                            <button 
                              onClick={() => navigate(`/tenant/payments?payment=${payment.id}`)}
                              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                            >
                              Lihat
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bulan
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Jumlah
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Aksi</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentPayments.map((payment) => (
                            <tr key={payment.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {new Date(payment.periode_mulai).toLocaleDateString('id-ID', {
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Mulai: {new Date(payment.periode_mulai).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      })}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Jatuh tempo: {getPaymentDueDate(payment).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                      })} (+30 hari)
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  Rp {payment.nominal_tagihan.toLocaleString('id-ID')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                  {payment.status === 'paid' ? 'Lunas' : payment.status === 'pending' ? 'Menunggu' : payment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  onClick={() => navigate(`/tenant/payments?payment=${payment.id}`)}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  Lihat
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Belum ada riwayat pembayaran</p>
                  </div>
                )}
              </div>

              {/* Recent Complaints - Responsive */}
              <div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Aduan Terbaru</h3>
                  <button 
                    onClick={() => navigate('/tenant/complaints')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center self-start"
                  >
                    Lihat Semua <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                
                {recentComplaints.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3 p-4">
                      {recentComplaints.map((complaint) => (
                        <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{complaint.title}</h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(complaint.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)} ml-2`}>
                              {complaint.status === 'in_progress' ? 'Diproses' : complaint.status === 'resolved' ? 'Selesai' : complaint.status}
                            </span>
                          </div>
                          <button 
                            onClick={() => navigate(`/tenant/complaints?complaint=${complaint.id}`)}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium mt-2"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tanggal
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Judul
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Aksi</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentComplaints.map((complaint) => (
                            <tr key={complaint.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(complaint.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {complaint.title}
                                </div>
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {complaint.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                                  {complaint.status === 'in_progress' ? 'Diproses' : complaint.status === 'resolved' ? 'Selesai' : complaint.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  onClick={() => navigate(`/tenant/complaints?complaint=${complaint.id}`)}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  Lihat
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Belum ada aduan</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
    </TenantLayout>
  );
};

export default TenantDashboard;
