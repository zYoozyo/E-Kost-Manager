import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { mockInviteService } from '../services/mockInviteService';
import toast from 'react-hot-toast';

// Simple mock user store in localStorage for demo only
const USERS_KEY = 'mock_users_v1';
const readUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
};
const writeUsers = (u: any[]) => localStorage.setItem(USERS_KEY, JSON.stringify(u));

export const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [invite, setInvite] = useState<any | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const v = mockInviteService.validateToken(token);
    setInvite(v);
  }, [token]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;
    if (password.length < 6) return toast.error('Password minimal 6 karakter');
    if (password !== confirm) return toast.error('Password tidak cocok');
    setLoading(true);
    try {
      // create user in mock store
      const users = readUsers();
      users.push({ id: Date.now(), name: invite.name || 'Penyewa', email: invite.email, role: 'tenant', ownerId: invite.ownerId });
      writeUsers(users);
      mockInviteService.markUsed(token);
      toast.success('Akun dibuat. Silakan login.');
      navigate('/auth/login');
    } catch (err) {
      toast.error('Gagal membuat akun');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="p-8">Token undangan tidak ditemukan.</div>;
  if (!invite) return <div className="p-8">Undangan tidak valid atau sudah kadaluwarsa.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-2">Terima Undangan</h2>
        <p className="text-sm text-gray-600 mb-4">Untuk {invite.email}. Silakan buat password untuk menyelesaikan pendaftaran.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Konfirmasi Password</label>
            <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded">{loading ? 'Memproses...' : 'Selesaikan Pendaftaran'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvite;
