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
  } | null;
}

export const ownerPaymentSettingsService = {
  async get(): Promise<OwnerPaymentSettings | null> {
    const response = await api.get<{ success: boolean; data: OwnerPaymentSettings | null }>(
      '/owner/payment-settings',
    );
    return response.data.data ?? null;
  },

  async update(data: Partial<OwnerPaymentSettings>): Promise<OwnerPaymentSettings> {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: OwnerPaymentSettings;
    }>('/owner/payment-settings', data);

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
