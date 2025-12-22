// File: src/services/paymentService.ts

import { api } from './api';

export type PaymentStatus =
  | 'pending'
  | 'waiting_verification'
  | 'paid'
  | 'late'
  | 'rejected';

export interface CreateQRISPaymentRequest {
  invoice_id: string;
  amount: number;
  description?: string;
}

export interface QRISPaymentResponse {
  qris_string: string;
  invoice_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired';
  expires_at: string;
  payment_url?: string;
}

export interface CheckPaymentStatusResponse {
  invoice_id: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  paid_at?: string;
  payment_method?: string;
}

export interface PaymentHistoryItem {
  id: number;
  invoice_code: string;
  nominal_tagihan: number;
  status: PaymentStatus;
  due_date: string | null;
  periode_mulai: string;
  periode_selesai: string;
  metode_pembayaran: string;
  created_at: string;
  owner?: {
    id: number;
    name: string;
    whatsapp?: string | null;
  } | null;
  kamar?: {
    id: number;
    nomor_kamar: string;
  } | null;
}

export interface OwnerPaymentApi {
  id: number;
  invoice_code: string;
  tenant?: {
    id: number;
    name: string;
    whatsapp?: string | null;
  } | null;
  kamar?: {
    id: number;
    nomor_kamar: string;
    kost?: {
      id: number;
      nama_kost: string;
    } | null;
  } | null;
  nominal_tagihan: number;
  nominal_dibayar?: number | null;
  status: PaymentStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  bukti_pembayaran_path?: string | null;
  bukti_pembayaran_url?: string | null;
  catatan?: string | null;
}

export interface OwnerPaymentSummary {
  total_due_this_month: number;
  paid_this_month: number;
  late_count: number;
  pending_count: number;
}

export interface OwnerPaymentsResult {
  payments: OwnerPaymentApi[];
  summary: OwnerPaymentSummary | null;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const paymentService = {
  async updatePayment(
    id: number,
    data: {
      status: PaymentStatus;
      nominal_dibayar?: number;
      catatan?: string;
      due_date?: string;
      metode_pembayaran?: string;
    },
  ): Promise<OwnerPaymentApi> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: OwnerPaymentApi;
    }>(`/payments/${id}`, data);

    return response.data.data;
  },

  async uploadPaymentProof(
    id: number,
    file: File,
    nominal_dibayar?: number,
  ): Promise<PaymentHistoryItem> {
    const formData = new FormData();
    formData.append('bukti', file);
    if (nominal_dibayar) {
      formData.append('nominal_dibayar', nominal_dibayar.toString());
    }

    const response = await api.post<{
      success: boolean;
      message: string;
      data: PaymentHistoryItem;
    }>(`/payments/${id}/proof`, formData);

    return response.data.data;
  },

  async getOwnerPayments(params?: {
    status?: PaymentStatus;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<OwnerPaymentsResult> {
    const response = await api.get<{
      success: boolean;
      data: {
        data: OwnerPaymentApi[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
      summary?: OwnerPaymentSummary;
    }>('/payments', {
      params,
    });

    const payload = response.data;
    return {
      payments: payload?.data?.data ?? [],
      summary: payload.summary ?? null,
      meta: {
        current_page: payload?.data?.current_page ?? 1,
        last_page: payload?.data?.last_page ?? 1,
        per_page: payload?.data?.per_page ?? (params?.per_page ?? 15),
        total: payload?.data?.total ?? payload?.data?.data?.length ?? 0,
      },
    };
  },

  async getAdminPayments(params?: {
    status?: PaymentStatus;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<OwnerPaymentsResult> {
    try {
      // Try admin endpoint first
      const response = await api.get<{
        success: boolean;
        data: {
          data: OwnerPaymentApi[];
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
        summary?: OwnerPaymentSummary;
      }>('/admin/payments', {
        params,
      });

      const payload = response.data;
      return {
        payments: payload?.data?.data ?? [],
        summary: payload.summary ?? null,
        meta: {
          current_page: payload?.data?.current_page ?? 1,
          last_page: payload?.data?.last_page ?? 1,
          per_page: payload?.data?.per_page ?? (params?.per_page ?? 15),
          total: payload?.data?.total ?? payload?.data?.data?.length ?? 0,
        },
      };
    } catch (error: any) {
      // If admin endpoint fails (404 or 403), fallback to regular payments endpoint
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log('Admin payments endpoint not available, falling back to regular payments endpoint');
        return this.getOwnerPayments(params);
      }
      // Re-throw other errors
      throw error;
    }
  },

  /**
   * Create QRIS payment - Generate QRIS code dari backend
   */
  async createQRISPayment(data: CreateQRISPaymentRequest): Promise<QRISPaymentResponse> {
    // TAMBAHKAN TIPE BALASAN DI SINI
    const response = await api.post<{ data: QRISPaymentResponse }>('/payments/qris/create', data);
    return response.data.data;
  },

  /**
   * Check payment status - Cek status pembayaran
   */
  async checkPaymentStatus(invoiceId: string): Promise<CheckPaymentStatusResponse> {
    // TAMBAHKAN TIPE BALASAN DI SINI
    const response = await api.get<{ data: CheckPaymentStatusResponse }>(`/payments/qris/status/${invoiceId}`);
    return response.data.data;
  },

  /**
   * Get payment history - Riwayat pembayaran untuk tenant yang sedang login
   */
  async getPaymentHistory(): Promise<PaymentHistoryItem[]> {
    const response = await api.get<{
      success: boolean;
      data: PaymentHistoryItem[];
    }>('/payments/history');

    return response.data.data ?? [];
  },

  /**
   * Generate monthly invoices - Generate tagihan bulanan untuk semua kamar yang terisi
   */
  async generateMonthlyInvoices(referenceDate?: string): Promise<{ created: number; message: string }> {
    const response = await api.post<{
      success: boolean;
      data: { created: number; message: string };
    }>('/payments/generate-monthly', {
      ...(referenceDate && { reference_date: referenceDate }),
    });

    return response.data.data;
  },
};