import { api } from './api';

// Simple in-memory cache for owner rooms & room types (per tab/session)
let ownerRoomsCache: OwnerRoom[] | null = null;
let ownerRoomsCacheTimestamp: number | null = null;
let ownerRoomTypesCache: OwnerRoomType[] | null = null;
let ownerRoomTypesCacheTimestamp: number | null = null;
const CACHE_TTL_MS = 180_000; // 3 minutes

// Tipe untuk kamar milik admin yang dikembalikan backend /admin/rooms
export interface OwnerRoom {
  id: number;
  kost_id: number;
  nomor_kamar: string;
  tipe_kamar: string;
  harga_sewa: number;
  status: 'tersedia' | 'terisi';
  tenant_id: number | null;
  tenant_name: string | null;
  tenant_email: string | null;
  tanggal_mulai_sewa: string | null;
  durasi_sewa: number | null;
  tanggal_akhir_sewa: string | null;
  catatan_sewa: string | null;
}

export interface OwnerRoomType {
  id: number;
  user_id: number;
  name: string;
  price: number;
  facilities?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// Response untuk endpoint /tenant/my-room
export interface TenantRoomResponse {
  kost: {
    id: number;
    nama_kost: string;
    alamat_kost: string;
    jumlah_kamar: number;
    harga: number;
  } | null;
  room: {
    id: number;
    nomor_kamar: string;
    tipe_kamar: string;
    harga_sewa: number;
    status: 'tersedia' | 'terisi';
  };
  owner: {
    id: number;
    name: string;
    phone: string | null;
    whatsapp: string | null;
  } | null;
}

export const roomService = {
  async getOwnerRooms(force = false): Promise<OwnerRoom[]> {
    const now = Date.now();

    if (
      !force &&
      ownerRoomsCache &&
      ownerRoomsCacheTimestamp &&
      now - ownerRoomsCacheTimestamp < CACHE_TTL_MS
    ) {
      return ownerRoomsCache;
    }

    const response = await api.get<{ success: boolean; data: OwnerRoom[] }>('/admin/rooms');
    const data = response.data.data || [];
    ownerRoomsCache = data;
    ownerRoomsCacheTimestamp = now;
    return data;
  },

  async getAdminRooms(force = false): Promise<OwnerRoom[]> {
    const now = Date.now();

    if (
      !force &&
      ownerRoomsCache &&
      ownerRoomsCacheTimestamp &&
      now - ownerRoomsCacheTimestamp < CACHE_TTL_MS
    ) {
      return ownerRoomsCache;
    }

    const response = await api.get<{ success: boolean; data: OwnerRoom[] }>('/admin/rooms');
    const data = response.data.data || [];
    ownerRoomsCache = data;
    ownerRoomsCacheTimestamp = now;
    return data;
  },

  async getOwnerRoomTypes(force = false): Promise<OwnerRoomType[]> {
    const now = Date.now();

    if (
      !force &&
      ownerRoomTypesCache &&
      ownerRoomTypesCacheTimestamp &&
      now - ownerRoomTypesCacheTimestamp < CACHE_TTL_MS
    ) {
      return ownerRoomTypesCache;
    }

    const response = await api.get<{ success: boolean; data: OwnerRoomType[] }>('/admin/room-types');
    const data = response.data.data || [];
    ownerRoomTypesCache = data;
    ownerRoomTypesCacheTimestamp = now;
    return data;
  },

  async getAdminRoomTypes(force = false): Promise<OwnerRoomType[]> {
    const now = Date.now();

    if (
      !force &&
      ownerRoomTypesCache &&
      ownerRoomTypesCacheTimestamp &&
      now - ownerRoomTypesCacheTimestamp < CACHE_TTL_MS
    ) {
      return ownerRoomTypesCache;
    }

    const response = await api.get<{ success: boolean; data: OwnerRoomType[] }>('/admin/room-types');
    const data = response.data.data || [];
    ownerRoomTypesCache = data;
    ownerRoomTypesCacheTimestamp = now;
    return data;
  },

  async createOwnerRoomType(payload: {
    name: string;
    price: number;
    facilities?: string;
    description?: string;
  }): Promise<OwnerRoomType> {
    const response = await api.post<{ success: boolean; data: OwnerRoomType }>('/admin/room-types', payload);
    // Invalidate cache so next fetch gets fresh data
    ownerRoomTypesCache = null;
    ownerRoomTypesCacheTimestamp = null;
    return response.data.data;
  },

  async updateOwnerRoomType(id: number, payload: {
    name?: string;
    price?: number;
    facilities?: string;
    description?: string;
  }): Promise<OwnerRoomType> {
    const response = await api.put<{ success: boolean; data: OwnerRoomType }>(`/admin/room-types/${id}`, payload);
    ownerRoomTypesCache = null;
    ownerRoomTypesCacheTimestamp = null;
    return response.data.data;
  },

  async deleteOwnerRoomType(id: number): Promise<void> {
    await api.delete(`/admin/room-types/${id}`);
    ownerRoomTypesCache = null;
    ownerRoomTypesCacheTimestamp = null;
  },

  async createOwnerRoom(payload: {
    nomor_kamar: string;
    tipe_kamar: string;
    harga_sewa: number;
    status?: 'tersedia' | 'terisi';
    kost_id?: number;
  }): Promise<OwnerRoom> {
    const response = await api.post<{ success: boolean; data: OwnerRoom }>('/admin/rooms', payload);
    ownerRoomsCache = null;
    ownerRoomsCacheTimestamp = null;
    return response.data.data;
  },

  async updateOwnerRoom(id: number, payload: {
    nomor_kamar?: string;
    tipe_kamar?: string;
    harga_sewa?: number;
    status?: 'tersedia' | 'terisi';
  }): Promise<OwnerRoom> {
    const response = await api.put<{ success: boolean; data: OwnerRoom }>(`/admin/rooms/${id}`, payload);
    ownerRoomsCache = null;
    ownerRoomsCacheTimestamp = null;
    return response.data.data;
  },

  async deleteOwnerRoom(id: number): Promise<void> {
    await api.delete(`/admin/rooms/${id}`);
    ownerRoomsCache = null;
    ownerRoomsCacheTimestamp = null;
  },

  async assignTenantToRoom(roomId: number, payload: {
    tenant_id: number | null;
    tanggal_mulai_sewa?: string;
    durasi_sewa?: number;
    catatan_sewa?: string;
  }): Promise<OwnerRoom> {
    const response = await api.put<{ success: boolean; data: OwnerRoom }>(
      `/admin/rooms/${roomId}/assign-tenant`,
      payload
    );
    ownerRoomsCache = null;
    ownerRoomsCacheTimestamp = null;
    return response.data.data;
  },

  async getTenantRoom(): Promise<TenantRoomResponse | null> {
    const response = await api.get<{ success: boolean; data: TenantRoomResponse | null }>(
      '/tenant/my-room'
    );
    return response.data.data ?? null;
  },
};
