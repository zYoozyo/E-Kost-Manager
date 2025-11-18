import { api } from './api';
import { User, LoginFormData, SignupFormData, LoginResponse, VerifyOtpResponse } from '../types';

export const authService = {
  async login(email: string, password: string, role: 'admin' | 'tenant'): Promise<LoginResponse> {
    // Pastikan role dikirim ke endpoint
    const response = await api.post('/auth/login', {
      email,
      password,
      role,
    });
    const data = response.data as { user: User; access_token: string; token_type: string };
    return { token: data.access_token, user: data.user } as LoginResponse;
  },

  async signup(data: SignupFormData) {
    const payload = {
      name: data.namaPemilik || data.name || '',
      email: data.email,
      password: data.password,
      password_confirmation: data.confirmPassword || data.password,
      role: data.role || 'admin',
      otp: data.otp,
      namaKost: data.namaKost,
      whatsapp: data.whatsapp,
      alamat: data.alamat,
      kodePos: data.kodePos,
      provinsi: data.provinsi,
      kota: data.kota,
      kecamatan: data.kecamatan,
      kelurahan: data.kelurahan,
      pilihanPembayaran: data.pilihanPembayaran,
    };

    console.log('📤 Sending signup payload:', payload);
    console.log('🔑 OTP value:', payload.otp);
    
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  async requestOTP(email: string) {
    const response = await api.post('/otp/request', { email });
    return response.data;
  },

  async verifyOTP(email: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await api.post('/otp/verify', { email, otp });
    const data = response.data as { message: string; success?: boolean };
    return { success: data.success ?? true, message: data.message } as VerifyOtpResponse;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>('/auth/profile');
    return response.data.data as User;
  },

  async updateProfile(data: FormData): Promise<User> {
    const response = await api.put<{ data: User }>('/auth/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data as User;
  },

  async logout() {
    await api.post('/auth/logout');
  },
};