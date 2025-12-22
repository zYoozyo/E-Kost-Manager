import { api } from './api';
import { User, LoginFormData, SignupFormData, LoginResponse, VerifyOtpResponse, OtpRequestResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('authService.login: Sending request to /auth/login');
      const response = await api.post('/auth/login', { email, password });
      console.log('authService.login: Response received:', response.data);
      
      // Handle both response structures
      const data = response.data as {
        access_token?: string;
        token?: string;
        user?: User;
        data?: { user?: User };
      };
      const token = data.access_token || data.token;
      const user = data.user || data.data?.user;
      
      if (!token) {
        console.error('authService.login: No token in response:', data);
        throw new Error('Token tidak ditemukan dalam response');
      }
      
      if (!user) {
        console.error('authService.login: No user in response:', data);
        throw new Error('Data user tidak ditemukan dalam response');
      }
      
      console.log('authService.login: Token found:', token.substring(0, 20) + '...');
      console.log('authService.login: User found:', user);
      
      sessionStorage.setItem('token', token);
      return { token, user } as LoginResponse;
    } catch (error: any) {
      console.error('authService.login: Error:', error);
      console.error('authService.login: Error response:', error.response?.data);
      throw error;
    }
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
    };
    
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  async requestOTP(email: string): Promise<OtpRequestResponse> {
    const response = await api.post('/otp/request', { email });
    return response.data as OtpRequestResponse;
  },

  async verifyOTP(email: string, otp: string): Promise<VerifyOtpResponse> {
    // Untuk forgot password, gunakan endpoint khusus
    const response = await api.post('/auth/verify-otp-forgot-password', { email, otp });
    const data = response.data as { message: string; success?: boolean };
    return { success: data.success ?? true, message: data.message } as VerifyOtpResponse;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>('/auth/profile');
    return response.data.data as User;
  },

  async updateProfile(data: FormData | Record<string, any>): Promise<User> {
    let response;
    if (data instanceof FormData) {
      if (!data.has('_method')) data.append('_method', 'PUT');
      response = await api.post<{ data: User }>('/auth/profile', data);
      console.log('API Response for FormData:', response.data);
    } else {
      response = await api.put<{ data: User }>('/auth/profile', data);
      console.log('API Response for JSON:', response.data);
    }
    return response.data.data as User;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(email: string, otp: string, password: string, passwordConfirmation: string) {
    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  },
};
