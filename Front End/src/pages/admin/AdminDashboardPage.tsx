import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Building2, Home, Users, DollarSign, TrendingUp, CreditCard, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roomService, OwnerRoom } from '../../services/roomService';
import { invitationService, OwnerTenantApi } from '../../services/invitationService';
import { paymentService, OwnerPaymentApi, OwnerPaymentsResult } from '../../services/paymentService';

type DashboardTenant = {
  id: number;
  name: string;
  email: string;
  room: string;
  status: string;
};

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<OwnerRoom[]>([]);
  const [tenants, setTenants] = useState<DashboardTenant[]>([]);
  const [paymentsResult, setPaymentsResult] = useState<OwnerPaymentsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [roomsData, tenantsData, paymentsData] = await Promise.all([
          roomService.getOwnerRooms(),
          invitationService.getOwnerTenants(),
          paymentService.getOwnerPayments(),
        ]);

        setRooms(roomsData);
        setPaymentsResult(paymentsData);

        setTenants(
          tenantsData.map((t: OwnerTenantApi) => ({
            id: t.id,
            name: t.name,
            email: t.email,
            room: t.room || '-',
            status: t.status || 'Tidak Aktif',
          }))
        );
      } catch (err: any) {
        console.error('Failed to load admin dashboard data', err);
        setError(err.response?.data?.message || 'Gagal memuat data dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalKost = user?.kosts?.length ?? 0;
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'tersedia').length;
  const totalTenants = tenants.length;
  
  // Real payment statistics from paymentsResult
  const payments = paymentsResult?.payments || [];
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.nominal_tagihan, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const thisMonthRevenue = payments
    .filter(p => {
      const paymentDate = new Date(p.created_at);
      const now = new Date();
      return p.status === 'paid' && 
             paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.nominal_tagihan, 0);

  const primaryKost = user?.kosts && user.kosts.length > 0 ? user.kosts[0] : undefined;
  const profileKost = user?.ownerProfile || null;

  const propertyName =
    profileKost?.nama_kost ||
    primaryKost?.nama_kost ||
    (user?.role === 'admin' && user?.name ? `${user.name} Kost` : 'Kost Anda');

  const propertyAddress =
    profileKost?.alamat ||
    primaryKost?.alamat_kost ||
    user?.address ||
    'Alamat belum diisi';

  const recentRooms = rooms.slice(0, 5);
  const recentTenants = tenants.slice(0, 5);

  return (
    <AdminLayout>
      {/* Header - Responsive */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-blue-500 rounded-lg">
              <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-900">Dashboard</h2>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
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
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-600" />
                  <span>Dashboard</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span>Penyewa</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span>Pembayaran</span>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-gray-600" />
                  <span>Fasilitas</span>
                </button>
              </nav>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stat cards - Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-blue-50 rounded-xl p-3 md:p-5 flex items-center">
            <div className="p-2 md:p-3 bg-blue-500 rounded-lg">
              <Building2 className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm text-gray-600">Total Kost</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{totalKost}</p>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-3 md:p-5 flex items-center">
            <div className="p-2 md:p-3 bg-green-500 rounded-lg">
              <Home className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm text-gray-600">Total Kamar</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{totalRooms}</p>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-3 md:p-5 flex items-center">
            <div className="p-2 md:p-3 bg-yellow-500 rounded-lg">
              <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm text-gray-600">Total Pendapatan</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-3 md:p-5 flex items-center">
            <div className="p-2 md:p-3 bg-purple-500 rounded-lg">
              <CreditCard className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="ml-3 md:ml-4">
              <p className="text-xs md:text-sm text-gray-600">Menunggu Pembayaran</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{pendingPayments}</p>
            </div>
          </div>
        </div>

        {/* Financial Summary - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 md:p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pendapatan Bulan Ini</h3>
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-2">
              Rp {thisMonthRevenue.toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-green-700">
              {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Statistik Penyewa</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalTenants}</p>
                <p className="text-sm text-blue-700">Total Penyewa</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{availableRooms}</p>
                <p className="text-sm text-blue-700">Kamar Tersedia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content: property + rooms + tenants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Kost & Rooms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kost summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {propertyName}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-1">{propertyAddress}</p>
              <p className="text-xs text-gray-500">
                Informasi ini berasal dari data profil pemilik & kost.
              </p>
            </div>

            {/* Rooms summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ringkasan Kamar</h3>
              </div>
              {recentRooms.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada kamar yang terdaftar.</p>
              ) : (
                <div className="space-y-3">
                  {recentRooms.map((room) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      {/* Room Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {room.nomor_kamar} - {room.tipe_kamar}
                          </p>
                          <p className="text-xs text-gray-500">
                            💰 Rp {room.harga_sewa.toLocaleString('id-ID')}/bulan
                          </p>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            room.status === 'tersedia'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {room.status === 'tersedia' ? 'Tersedia' : 'Terisi'}
                        </span>
                      </div>

                      {/* Tenant Info */}
                      {room.tenant_name && (
                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-700 mb-1">
                                👤 {room.tenant_name}
                              </p>
                              {room.tenant_email && (
                                <p className="text-xs text-gray-500 mb-2">
                                  📧 {room.tenant_email}
                                </p>
                              )}
                              
                              {/* Rental Period Info */}
                              {room.tanggal_mulai_sewa && room.durasi_sewa && (
                                <div className="bg-blue-50 rounded-md p-2 text-xs">
                                  <p className="font-medium text-blue-800 mb-1">
                                    📅 Periode Sewa
                                  </p>
                                  <div className="text-blue-700">
                                    <p>
                                      {new Date(room.tanggal_mulai_sewa).toLocaleDateString('id-ID')} - 
                                      {room.tanggal_akhir_sewa ? 
                                        new Date(room.tanggal_akhir_sewa).toLocaleDateString('id-ID') : 
                                        `${room.durasi_sewa} bulan`
                                      }
                                    </p>
                                    <p className="text-xs mt-1">
                                      ⏱Durasi: {room.durasi_sewa} bulan
                                    </p>
                                  </div>
                                  {room.catatan_sewa && (
                                    <p className="text-xs text-blue-600 mt-1 italic">
                                      📝 {room.catatan_sewa}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Tenants summary */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Penyewa Terbaru
              </h3>
              {recentTenants.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Belum ada penyewa yang terdaftar dari undangan.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="border border-gray-200 rounded-lg px-4 py-3 bg-white"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {tenant.name}
                      </p>
                      <p className="text-xs text-gray-500">{tenant.email}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Kamar: {tenant.room}</span>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            tenant.status === 'Aktif'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading && (
          <p className="mt-4 text-xs text-gray-400">Memuat data terbaru...</p>
        )}
    </AdminLayout>
  );
};
