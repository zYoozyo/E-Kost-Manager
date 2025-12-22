import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Building2, Home, Plus, List, Edit, Trash2, Tag, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roomService, OwnerRoom, OwnerRoomType } from '../../services/roomService';

export const AdminFacilitiesPage: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'rooms' | 'room-types' | 'add-room-type' | 'edit-room-type' | 'edit-property'>('rooms');
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  // Daftar tipe kamar milik owner (real-time dari backend)
  const [roomTypes, setRoomTypes] = useState<{
    id: string;
    name: string;
    price: number;
    facilities: string;
    description?: string;
  }[]>([]);

  // Daftar kamar milik owner (real-time dari backend)
  const [rooms, setRooms] = useState<{
    id: string;
    roomNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    price: string;
    isAvailable: boolean;
    tenant: string | null;
  }[]>([]);

  // Form data untuk edit properti (berdasarkan data pemilik)
  const [propertyForm, setPropertyForm] = useState({
    name: '',
    address: '',
    description: '',
    facilities: '',
  });

  // Hitung info properti berdasarkan data owner profile / kost / user
  const primaryKost = user?.kosts && user.kosts.length > 0 ? user.kosts[0] : undefined;
  const profileKost = user?.adminProfile || null;

  const propertyName =
    propertyForm.name ||
    profileKost?.nama_kost ||
    primaryKost?.nama_kost ||
    (user?.role === 'admin' && user?.name ? `${user.name} Kost` : 'Kost Anda');

  const propertyAddress =
    propertyForm.address ||
    profileKost?.alamat ||
    primaryKost?.alamat_kost ||
    user?.address ||
    'Alamat belum diisi';
  const propertyDescription = propertyForm.description || 'Kost nyaman dengan fasilitas lengkap';
  const propertyFacilities = propertyForm.facilities || 'WiFi, AC, Kamar Mandi Dalam, Parkir';

  // Ambil daftar kamar & tipe kamar dari backend saat halaman dibuka
  useEffect(() => {
    const fetchRoomsAndTypes = async () => {
      try {
        // Ambil tipe kamar & kamar secara paralel untuk mempercepat loading
        const [types, data] = await Promise.all([
          roomService.getAdminRoomTypes(),
          roomService.getAdminRooms(),
        ]);

        setRoomTypes(
          types.map((t: OwnerRoomType) => ({
            id: String(t.id),
            name: t.name,
            price: t.price,
            facilities: t.facilities || '',
            description: t.description || '',
          }))
        );

        setRooms(
          data.map((room: OwnerRoom) => ({
            id: String(room.id),
            roomNumber: room.nomor_kamar,
            roomTypeId: '', // belum ada tipe kamar terpisah di backend
            roomTypeName: room.tipe_kamar,
            price: `Rp ${room.harga_sewa.toLocaleString('id-ID')}`,
            isAvailable: room.status === 'tersedia',
            tenant: room.tenant_name,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch owner rooms or room types', error);
      }
    };

    fetchRoomsAndTypes();
  }, []);

  // Form data untuk tambah/edit tipe kamar
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    price: '',
    facilities: '',
    description: '',
  });

  // Form data untuk tambah/edit kamar
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    roomTypeId: '',
    isAvailable: true,
  });

  const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPropertyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomTypeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRoomTypeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setRoomForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update property functionality
    console.log('Property form submitted:', propertyForm);
    setActiveTab('rooms');
  };

  const handleEditRoomType = (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    if (roomType) {
      setRoomTypeForm({
        name: roomType.name,
        price: roomType.price.toString(),
        facilities: roomType.facilities,
        description: roomType.description || '',
      });
      setEditingRoomTypeId(roomTypeId);
      setActiveTab('edit-room-type');
    }
  };

  const handleRoomTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseInt(roomTypeForm.price || '0', 10);

    const save = async () => {
      if (editingRoomTypeId) {
        // Update existing room type via API
        const updated = await roomService.updateOwnerRoomType(Number(editingRoomTypeId), {
          name: roomTypeForm.name,
          price,
          facilities: roomTypeForm.facilities,
          description: roomTypeForm.description,
        });

        setRoomTypes(roomTypes.map(rt => 
          rt.id === editingRoomTypeId 
            ? {
                id: String(updated.id),
                name: updated.name,
                price: updated.price,
                facilities: updated.facilities || '',
                description: updated.description || '',
              }
            : rt
        ));
        setEditingRoomTypeId(null);
      } else {
        // Add new room type via API
        const created = await roomService.createOwnerRoomType({
          name: roomTypeForm.name,
          price,
          facilities: roomTypeForm.facilities,
          description: roomTypeForm.description,
        });

        const newRoomType = {
          id: String(created.id),
          name: created.name,
          price: created.price,
          facilities: created.facilities || '',
          description: created.description || '',
        };
        setRoomTypes([...roomTypes, newRoomType]);
      }

      setActiveTab('room-types');
      setRoomTypeForm({ name: '', price: '', facilities: '', description: '' });
    };

    save().catch((error) => {
      console.error('Failed to save room type', error);
    });
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const selectedRoomType = roomTypes.find(rt => rt.id === roomForm.roomTypeId);
      const hargaSewa = selectedRoomType ? selectedRoomType.price : 0;

      if (editingRoomId) {
        // Update existing room
        const updatedRoom = await roomService.updateOwnerRoom(Number(editingRoomId), {
          nomor_kamar: roomForm.roomNumber,
          tipe_kamar: selectedRoomType?.name || 'Standard',
          harga_sewa: hargaSewa,
          status: roomForm.isAvailable ? 'tersedia' : 'terisi',
        });

        setRooms(rooms.map((room) =>
          room.id === editingRoomId
            ? {
                id: String(updatedRoom.id),
                roomNumber: updatedRoom.nomor_kamar,
                roomTypeId: roomForm.roomTypeId,
                roomTypeName: updatedRoom.tipe_kamar,
                price: `Rp ${updatedRoom.harga_sewa.toLocaleString('id-ID')}`,
                isAvailable: updatedRoom.status === 'tersedia',
                tenant: updatedRoom.tenant_name || null,
              }
            : room
        ));
      } else {
        // Create new room
        const createdRoom = await roomService.createOwnerRoom({
          nomor_kamar: roomForm.roomNumber,
          tipe_kamar: selectedRoomType?.name || 'Standard',
          harga_sewa: hargaSewa,
          status: roomForm.isAvailable ? 'tersedia' : 'terisi',
        });

        const newRoom = {
          id: String(createdRoom.id),
          roomNumber: createdRoom.nomor_kamar,
          roomTypeId: roomForm.roomTypeId,
          roomTypeName: createdRoom.tipe_kamar,
          price: `Rp ${createdRoom.harga_sewa.toLocaleString('id-ID')}`,
          isAvailable: createdRoom.status === 'tersedia',
          tenant: createdRoom.tenant_name || null,
        };

        setRooms([...rooms, newRoom]);
      }

      setActiveTab('rooms');
      setRoomForm({ roomNumber: '', roomTypeId: '', isAvailable: true });
      setEditingRoomId(null);
    } catch (error) {
      console.error('Failed to save room', error);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await roomService.deleteOwnerRoom(Number(roomId));
      setRooms(rooms.filter(room => room.id !== roomId));
    } catch (error) {
      console.error('Failed to delete room', error);
    }
  };

  const handleDeleteRoomType = (roomTypeId: string) => {
    // Check if any room is using this type
    const roomsUsingType = rooms.filter(r => r.roomTypeId === roomTypeId);
    if (roomsUsingType.length > 0) {
      alert(`Tipe kamar ini sedang digunakan oleh ${roomsUsingType.length} kamar. Hapus kamar terlebih dahulu.`);
      return;
    }

    roomService.deleteOwnerRoomType(Number(roomTypeId))
      .then(() => {
        setRoomTypes(roomTypes.filter(rt => rt.id !== roomTypeId));
      })
      .catch((error) => {
        console.error('Failed to delete room type', error);
      });
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
        {/* Header - Responsive */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-blue-500 rounded-lg">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Fasilitas</h2>
        </div>

        {/* Info Properti - Responsive */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{propertyName}</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">{propertyAddress}</p>
              <p className="text-xs sm:text-sm text-gray-700 mb-2">{propertyDescription}</p>
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Fasilitas:</span> {propertyFacilities}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('edit-property')}
              className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Edit className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Edit Properti</span>
            </button>
          </div>
        </div>

        {/* Tabs - Responsive */}
        <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap min-h-[44px] touch-manipulation ${
                activeTab === 'rooms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Daftar Kamar</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('room-types');
                setEditingRoomTypeId(null);
                setRoomTypeForm({ name: '', price: '', facilities: '', description: '' });
              }}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap min-h-[44px] touch-manipulation ${
                activeTab === 'room-types' || activeTab === 'add-room-type' || activeTab === 'edit-room-type'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Tipe Kamar</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div>
          {/* Tab: Daftar Kamar */}
          {activeTab === 'rooms' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Kamar: <span className="font-semibold text-gray-900">{rooms.length}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Tersedia: <span className="font-semibold text-green-600">
                      {rooms.filter(r => r.isAvailable).length}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddRoomForm(true);
                    setEditingRoomId(null);
                    setRoomForm({ roomNumber: '', roomTypeId: '', isAvailable: true });
                  }}
                  className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Tambah Kamar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`border-2 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow ${
                      room.isAvailable
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Home className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${room.isAvailable ? 'text-green-600' : 'text-gray-400'}`} />
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">{room.roomNumber}</h3>
                      </div>
                      <span className={`px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                        room.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {room.isAvailable ? 'Tersedia' : 'Terisi'}
                      </span>
                    </div>
                    <div className="mb-2 sm:mb-3">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{room.price}</p>
                      <p className="text-xs text-gray-500 truncate">Tipe: {room.roomTypeName}</p>
                    </div>
                    {room.tenant && (
                      <p className="text-xs text-gray-600 mb-2 sm:mb-3 truncate">
                        Penyewa: <span className="font-medium">{room.tenant}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => {
                          setEditingRoomId(room.id);
                          const matchedType = roomTypes.find(rt => rt.name === room.roomTypeName);
                          setRoomForm({
                            roomNumber: room.roomNumber,
                            roomTypeId: matchedType ? matchedType.id : '',
                            isAvailable: room.isAvailable,
                          });
                          setShowAddRoomForm(true);
                        }}
                        className="flex-1 px-2.5 sm:px-3 py-1.5 bg-blue-500 text-white rounded text-xs sm:text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 min-h-[36px] touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="px-2.5 sm:px-3 py-1.5 bg-red-500 text-white rounded text-xs sm:text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-1 min-h-[36px] min-w-[36px] touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Tambah/Edit Kamar - Inline dalam tab Daftar Kamar */}
              {showAddRoomForm && (
                <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {editingRoomId ? 'Edit Kamar' : 'Tambah Kamar'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddRoomForm(false);
                        setEditingRoomId(null);
                        setRoomForm({ roomNumber: '', roomTypeId: '', isAvailable: true });
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    handleRoomSubmit(e);
                    setShowAddRoomForm(false);
                  }} className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Pilih Tipe Kamar *
                      </label>
                      <select
                        name="roomTypeId"
                        value={roomForm.roomTypeId}
                        onChange={handleRoomInputChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                        required
                      >
                        <option value="">Pilih tipe kamar</option>
                        {roomTypes.map((roomType) => (
                          <option key={roomType.id} value={roomType.id}>
                            {roomType.name} - Rp {roomType.price.toLocaleString('id-ID')}
                          </option>
                        ))}
                      </select>
                      {roomForm.roomTypeId && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          {(() => {
                            const selectedType = roomTypes.find(rt => rt.id === roomForm.roomTypeId);
                            return selectedType ? (
                              <>
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">
                                  Harga: Rp {selectedType.price.toLocaleString('id-ID')}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Fasilitas: {selectedType.facilities}
                                </p>
                              </>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Nomor Kamar
                      </label>
                      <input
                        type="text"
                        name="roomNumber"
                        value={roomForm.roomNumber}
                        onChange={handleRoomInputChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                        placeholder="Contoh: A-101"
                        required
                      />
                    </div>

                    <div className="flex items-center min-h-[44px]">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={roomForm.isAvailable}
                        onChange={handleRoomInputChange}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                        Kamar tersedia
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-3 sm:pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddRoomForm(false);
                          setEditingRoomId(null);
                          setRoomForm({ roomNumber: '', roomTypeId: '', isAvailable: true });
                        }}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span>{editingRoomId ? 'Simpan Perubahan' : 'Tambah Kamar'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {rooms.length === 0 && !showAddRoomForm && (
                <div className="text-center py-8 sm:py-12">
                  <Home className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500">Belum ada kamar. Tambah kamar pertama Anda.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Edit Properti */}
          {activeTab === 'edit-property' && (
            <form onSubmit={handlePropertySubmit} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Properti
                </label>
                <input
                  type="text"
                  name="name"
                  value={propertyForm.name}
                  onChange={handlePropertyInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama properti"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={propertyForm.address}
                  onChange={handlePropertyInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan alamat lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={propertyForm.description}
                  onChange={handlePropertyInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan deskripsi properti"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasilitas (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  name="facilities"
                  value={propertyForm.facilities}
                  onChange={handlePropertyInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: WiFi, AC, Kamar Mandi Dalam, Parkir"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('rooms')}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          {/* Tab: Tipe Kamar */}
          {activeTab === 'room-types' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Tipe: <span className="font-semibold text-gray-900">{roomTypes.length}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingRoomTypeId(null);
                    setRoomTypeForm({ name: '', price: '', facilities: '', description: '' });
                    setActiveTab('add-room-type');
                  }}
                  className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">Tambah Tipe Kamar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {roomTypes.map((roomType) => (
                  <div
                    key={roomType.id}
                    className="border-2 border-purple-200 bg-purple-50 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">{roomType.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditRoomType(roomType.id)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center touch-manipulation"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoomType(roomType.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center touch-manipulation"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 sm:mb-2 truncate">
                      Rp {roomType.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-600 mb-1 sm:mb-2 line-clamp-2">{roomType.description}</p>
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-purple-200">
                      <p className="text-xs font-medium text-gray-700 mb-1">Fasilitas:</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{roomType.facilities}</p>
                    </div>
                  </div>
                ))}
              </div>

              {roomTypes.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <Tag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500">Belum ada tipe kamar. Tambah tipe kamar pertama Anda.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Tambah/Edit Tipe Kamar */}
          {(activeTab === 'add-room-type' || activeTab === 'edit-room-type') && (
            <form onSubmit={handleRoomTypeSubmit} className="space-y-6 max-w-2xl">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingRoomTypeId ? 'Edit Tipe Kamar' : 'Tambah Tipe Kamar'}
                </h3>
                <p className="text-sm text-gray-600">
                  {editingRoomTypeId ? 'Ubah informasi tipe kamar' : 'Buat tipe kamar baru dengan harga dan fasilitas tertentu'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Tipe Kamar
                </label>
                <input
                  type="text"
                  name="name"
                  value={roomTypeForm.name}
                  onChange={handleRoomTypeInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Contoh: Standard, Deluxe, Premium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga Sewa (per bulan)
                </label>
                <input
                  type="number"
                  name="price"
                  value={roomTypeForm.price}
                  onChange={handleRoomTypeInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Rp 0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={roomTypeForm.description}
                  onChange={handleRoomTypeInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Deskripsi singkat tentang tipe kamar ini"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fasilitas (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  name="facilities"
                  value={roomTypeForm.facilities}
                  onChange={handleRoomTypeInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Contoh: AC, WiFi, Kamar Mandi Dalam, TV"
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('room-types');
                    setEditingRoomTypeId(null);
                    setRoomTypeForm({ name: '', price: '', facilities: '', description: '' });
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  {editingRoomTypeId ? (
                    <>
                      <Edit className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Tambah Tipe Kamar
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

