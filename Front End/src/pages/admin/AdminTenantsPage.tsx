import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Users, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { roomService, OwnerRoom } from '../../services/roomService';
import { invitationService, OwnerTenantApi } from '../../services/invitationService';
import { api } from '../../services/api';

type TenantApiUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  room?: string | null;
  status?: string | null;
};

export const AdminTenantsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<{
    id: number;
    name: string;
    email: string;
    phone: string;
    room: string;
    status: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<OwnerRoom[]>([]);
  const [assigningTenantId, setAssigningTenantId] = useState<number | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<{
    id: number;
    name: string;
    email: string;
    phone: string;
    room: string;
    status: string;
  } | null>(null);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [roomModalTenant, setRoomModalTenant] = useState<{
    id: number;
    name: string;
    email: string;
    phone: string;
    room: string;
    status: string;
  } | null>(null);
  const [rentalForm, setRentalForm] = useState({
    tanggal_mulai_sewa: '',
    durasi_sewa: 1,
    catatan_sewa: '',
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [response, roomsData] = await Promise.all([
        api.get<{ success: boolean; data: any[] }>('/admin/tenants'),
        roomService.getAdminRooms(),
      ]);
      
      const data = response.data.data || [];

      const mapped = data.map((t) => ({
                id: t.id,
                name: t.name,
                email: t.email,
                phone: t.phone || t.whatsapp || '-',
                room: t.room || '-',
                status: (t.room && t.room !== '-') ? 'Aktif' : 'Tidak Aktif',
              }));

      setTenants(mapped);
      setRooms(roomsData);
    } catch (err: any) {
      console.error('Failed to fetch tenants or rooms', err);
      setError(err.response?.data?.message || 'Gagal memuat data penyewa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignRoomChange = async (tenantId: number, newRoomId: string) => {
    const selectedRoomId = newRoomId ? Number(newRoomId) : null;

    setAssigningTenantId(tenantId);

    try {
      // Cari kamar yang saat ini ditempati tenant ini
      const currentRooms = rooms.filter((room) => room.tenant_id === tenantId);

      const ops: Promise<OwnerRoom>[] = [];

      // Lepas semua kamar lama kecuali jika sama dengan kamar baru
      const roomsToClear = currentRooms.filter((room) => !selectedRoomId || room.id !== selectedRoomId);
      roomsToClear.forEach((room) => {
        ops.push(roomService.assignTenantToRoom(room.id, { tenant_id: null }));
      });

      // Assign kamar baru jika dipilih
      if (selectedRoomId) {
        ops.push(roomService.assignTenantToRoom(selectedRoomId, { 
          tenant_id: tenantId,
          tanggal_mulai_sewa: rentalForm.tanggal_mulai_sewa || new Date().toISOString().split('T')[0],
          durasi_sewa: rentalForm.durasi_sewa,
          catatan_sewa: rentalForm.catatan_sewa,
        }));
      }

      const results = await Promise.all(ops);

      // Update daftar kamar lokal berdasarkan hasil API
      setRooms((prev) =>
        prev.map((room) => {
          const updated = results.find((r) => r.id === room.id);
          return updated ? updated : room;
        })
      );

      // Tentukan kamar akhir untuk tenant ini
      const newRoom = results.find((r) => r.tenant_id === tenantId) || null;
      const finalRoomLabel = newRoom ? newRoom.nomor_kamar : '-';
      const finalStatus = (finalRoomLabel && finalRoomLabel !== '-') ? 'Aktif' : 'Tidak Aktif';

      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenantId ? { ...t, room: finalRoomLabel, status: finalStatus } : t
        )
      );

      // Jika modal atur kamar sedang terbuka untuk tenant ini, tutup setelah berhasil
      setRoomModalTenant((prev) => (prev && prev.id === tenantId ? null : prev));
      
      // Reset rental form
      setRentalForm({
        tanggal_mulai_sewa: '',
        durasi_sewa: 1,
        catatan_sewa: '',
      });
      setSelectedRoomId('');
    } catch (err) {
      console.error('Failed to assign room', err);
    } finally {
      setAssigningTenantId(null);
    }
  };

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-purple-500 rounded-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Penyewa</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Cari penyewa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2.5 sm:space-y-3">
          {filteredTenants.map((tenant) => {
            const isActiveTenant = tenant.status === 'Aktif';
            const statusClass = isActiveTenant
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800';

            return (
              <div key={tenant.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 truncate">{tenant.name}</h3>
                    <p className="text-xs text-gray-600 truncate">{tenant.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{tenant.phone}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full flex-shrink-0 ${statusClass}`}>
                    {tenant.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                      tenant.room !== '-' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tenant.room !== '-' ? `Kamar: ${tenant.room}` : 'Belum ada kamar'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setRoomModalTenant(tenant)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs rounded bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 min-h-[36px] touch-manipulation"
                    disabled={assigningTenantId === tenant.id}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <span className="truncate">Atur Kamar</span>
                  </button>
                  <button
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 min-h-[36px] touch-manipulation"
                    onClick={() => {
                      setSelectedTenant(tenant);
                      setShowTenantModal(true);
                    }}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Detail</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nomor Telepon
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kamar
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant) => {
                const currentRoom = rooms.find((room) => room.tenant_id === tenant.id);
                const selectedRoomId = currentRoom ? String(currentRoom.id) : '';

                // Hanya tampilkan kamar yang masih tersedia atau kamar yang sudah dimiliki tenant ini
                const dropdownRooms = rooms.filter((room) =>
                  room.status === 'tersedia' || room.id === currentRoom?.id
                );

                const isActiveTenant = tenant.status === 'Aktif';
                const statusClass = isActiveTenant
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800';

                return (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tenant.name}
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {tenant.email}
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {tenant.phone}
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tenant.room !== '-' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tenant.room !== '-' ? `Kamar: ${tenant.room}` : 'Belum ada kamar'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRoomModalTenant(tenant)}
                          className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium border border-purple-200 text-purple-700 rounded-md bg-white hover:bg-purple-50 hover:border-purple-400 transition-colors"
                          disabled={assigningTenantId === tenant.id}
                        >
                          Atur Kamar
                        </button>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowTenantModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showTenantModal && selectedTenant && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Penyewa</h3>
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <p>
                <span className="font-medium">Nama:</span> {selectedTenant.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {selectedTenant.email}
              </p>
              <p>
                <span className="font-medium">Telepon:</span> {selectedTenant.phone}
              </p>
              <p>
                <span className="font-medium">Kamar:</span> {selectedTenant.room}
              </p>
              <p>
                <span className="font-medium">Status:</span> {selectedTenant.status}
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowTenantModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {roomModalTenant && (() => {
        const eligibleRooms = rooms.filter((room) =>
          room.status === 'tersedia' || room.tenant_id === roomModalTenant.id
        );

        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Atur Kamar untuk {roomModalTenant.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Set periode sewa dan pilih kamar untuk penyewa ini.
              </p>

              {/* Rental Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Periode Sewa</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tanggal Mulai Sewa
                    </label>
                    <input
                      type="date"
                      value={rentalForm.tanggal_mulai_sewa}
                      onChange={(e) => setRentalForm(prev => ({ ...prev, tanggal_mulai_sewa: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Durasi Sewa
                    </label>
                    <select
                      value={rentalForm.durasi_sewa}
                      onChange={(e) => setRentalForm(prev => ({ ...prev, durasi_sewa: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value={1}>1 Bulan</option>
                      <option value={3}>3 Bulan</option>
                      <option value={6}>6 Bulan</option>
                      <option value={12}>12 Bulan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Catatan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={rentalForm.catatan_sewa}
                      onChange={(e) => setRentalForm(prev => ({ ...prev, catatan_sewa: e.target.value }))}
                      placeholder="Contoh: Sewa 6 bulan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                {rentalForm.tanggal_mulai_sewa && rentalForm.durasi_sewa && (
                  <div className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">Periode:</span> {rentalForm.tanggal_mulai_sewa} s.d. 
                    {new Date(new Date(rentalForm.tanggal_mulai_sewa).setMonth(new Date(rentalForm.tanggal_mulai_sewa).getMonth() + rentalForm.durasi_sewa)).toLocaleDateString('id-ID')}
                  </div>
                )}
              </div>

              {/* Room Selection */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Pilih Kamar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto">
                  {eligibleRooms.length === 0 ? (
                    <p className="text-sm text-gray-500 col-span-full">
                      Belum ada kamar yang tersedia untuk dipilih.
                    </p>
                  ) : (
                    eligibleRooms.map((room) => {
                      const isCurrent = room.tenant_id === roomModalTenant.id;
                      const isAvailable = room.status === 'tersedia';

                      const badgeClass = isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700';

                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setSelectedRoomId(String(room.id))}
                        disabled={assigningTenantId === roomModalTenant.id}
                        className={`w-full text-left border rounded-lg p-4 transition-colors ${
                          selectedRoomId === String(room.id)
                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                            : isCurrent
                            ? 'border-gray-400 bg-gray-50'
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {room.nomor_kamar}
                            </p>
                            <p className="text-xs text-gray-500">
                              {room.tipe_kamar} - Rp {room.harga_sewa.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
                          >
                            {isAvailable ? 'Tersedia' : 'Terisi'}
                          </span>
                        </div>
                        {room.tenant_name && (
                          <p className="mt-1 text-xs text-gray-500">
                            Penyewa: {room.tenant_name}
                          </p>
                        )}
                        {isCurrent && (
                          <p className="mt-2 text-xs text-purple-700 font-medium">
                            Kamar saat ini
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => handleAssignRoomChange(roomModalTenant.id, '')}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  disabled={assigningTenantId === roomModalTenant.id}
                >
                  Lepas Kamar
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRoomModalTenant(null);
                      setSelectedRoomId('');
                      setRentalForm({
                        tanggal_mulai_sewa: '',
                        durasi_sewa: 1,
                        catatan_sewa: '',
                      });
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedRoomId) {
                        handleAssignRoomChange(roomModalTenant.id, selectedRoomId);
                      }
                    }}
                    disabled={!selectedRoomId || assigningTenantId === roomModalTenant.id}
                    className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {assigningTenantId === roomModalTenant.id ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </AdminLayout>
  );
};
