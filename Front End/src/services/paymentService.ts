import { api } from './api';

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

export const paymentService = {
  /**
   * Create QRIS payment - Generate QRIS code dari backend
   */
  async createQRISPayment(data: CreateQRISPaymentRequest): Promise<QRISPaymentResponse> {
    const response = await api.post('/payments/qris/create', data);
    return response.data.data as QRISPaymentResponse;
  },

  /**
   * Check payment status - Cek status pembayaran
   */
  async checkPaymentStatus(invoiceId: string): Promise<CheckPaymentStatusResponse> {
    const response = await api.get(`/payments/qris/status/${invoiceId}`);
    return response.data.data as CheckPaymentStatusResponse;
  },

  /**
   * Get payment history - Riwayat pembayaran
   */
  async getPaymentHistory() {
    const response = await api.get('/payments/history');
    return response.data.data;
  },
};

