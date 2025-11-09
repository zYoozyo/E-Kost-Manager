import { api } from './api';
import { User, LoginFormData, SignupFormData, LoginResponse } from '../types';

export const authService = {
  async login(email: string, password: string, role: 'admin' | 'tenant'): Promise<LoginResponse> {
    const response = await api.post('/auth/login', {
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

  async verifyOTP(email: string, otp: string) {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data.data as User;
  },

  async logout() {
    await api.post('/auth/logout');
  },
};
