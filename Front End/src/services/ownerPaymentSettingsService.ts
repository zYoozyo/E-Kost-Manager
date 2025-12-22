import { api } from './api';

export interface OwnerPaymentSettings {
  id: number;
  user_id: number;
  nama_kost: string | null;
  alamat: string | null;
  kode_pos: string | null;
  provinsi: string | null;
  kota: string | null;
  kecamatan: string | null;
  kelurahan: string | null;
  pilihan_pembayaran: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
  qris_payload: string | null;
  qris_image_path?: string | null;
  qris_image_url?: string | null;
}

export interface TenantPaymentSettings {
  owner: {
    id: number;
    name: string;
    whatsapp?: string | null;
  };
  payment_settings: {
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_holder: string | null;
    qris_payload: string | null;
    qris_image_url?: string | null;
  } | null;
}

export const ownerPaymentSettingsService = {
  async get(): Promise<OwnerPaymentSettings | null> {
    console.log('Fetching admin payment settings from /admin/payment-settings');
    const response = await api.get<{ success: boolean; data: OwnerPaymentSettings | null }>(
      '/admin/payment-settings',
    );
    console.log('Payment settings response:', response.data);
    return response.data.data ?? null;
  },

  async update(data: Partial<OwnerPaymentSettings> | FormData): Promise<OwnerPaymentSettings> {
    let response;
    if (data instanceof FormData) {
      // For file uploads, use POST (Laravel handles file uploads via POST)
      response = await api.post<{
        success: boolean;
        message: string;
        data: OwnerPaymentSettings;
      }>('/admin/payment-settings', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      response = await api.put<{
        success: boolean;
        message: string;
        data: OwnerPaymentSettings;
      }>('/admin/payment-settings', data);
    }

    return response.data.data;
  },

  async getForTenant(): Promise<TenantPaymentSettings | null> {
    const response = await api.get<{
      success: boolean;
      data: TenantPaymentSettings | null;
    }>('/tenant/payment-settings');

    return response.data.data ?? null;
  },
};
