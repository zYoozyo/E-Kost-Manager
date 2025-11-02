import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Lock, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginFormData } from '../types';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'tenant'>('tenant');
  const { login, demoLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, selectedRole);
      toast.success('Login berhasil!');
      if (selectedRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/tenant');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login gagal');
    }
  };

  const handleDemoLogin = async () => {
    try {
      await demoLogin(selectedRole);
      toast.success(`Login demo berhasil sebagai ${selectedRole === 'admin' ? 'Pemilik' : 'Penyewa'}!`);
      if (selectedRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/tenant');
      }
    } catch (error: any) {
      toast.error('Login demo gagal');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" data-aos="fade-up">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
          <p className="text-gray-600">Masuk ke akun Anda</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Masuk sebagai:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('tenant')}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedRole === 'tenant'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <User className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Penyewa</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedRole === 'admin'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Building2 className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">Pemilik</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { required: 'Email wajib diisi' })}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black"
                placeholder="Masukkan email Anda"
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password wajib diisi' })}
                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-black"
                placeholder="Masukkan password Anda"
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">atau</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-navy-900 py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Memproses...' : 'Login Demo'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Daftar sebagai pemilik
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};