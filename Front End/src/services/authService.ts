import { api } from './api';
import { User, LoginFormData, SignupFormData, LoginResponse, VerifyOtpResponse } from '../types';

export const authService = {
  async login(email: string, password: string, role: 'admin' | 'tenant'): Promise<LoginResponse> {
    const response = await api.post<{ data: LoginResponse }>('/auth/login', {
    email,
    password,
    role,
  });
  return response.data.data as LoginResponse;
},

  async signup(data: SignupFormData) {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  async requestOTP(email: string) {
    const response = await api.post('/auth/request-otp', { email });
    return response.data;
  },

  async verifyOTP(email: string, otp: string): Promise<VerifyOtpResponse> {
    const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', { email, otp });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>('/auth/profile');
  return response.data.data as User;
  },

async updateProfile(data: FormData): Promise<User> {
  const response = await api.post<{ data: User }>('/auth/profile', data, {
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
