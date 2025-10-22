import React, { useState } from 'react';
import { mockInviteService } from '../services/mockInviteService';
import toast from 'react-hot-toast';

interface InviteTenantProps {
  ownerId: number | string;
  onClose: () => void;
}

const InviteTenant: React.FC<InviteTenantProps> = ({ ownerId, onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const invite = mockInviteService.createInvite(ownerId, email, name);
      // For demo, we show the token and a copyable link
      const link = `${window.location.origin}/accept-invite?token=${invite.token}`;
      toast.success('Undangan dibuat. Salin link undangan untuk dikirim ke penyewa.');
      // show modal close after a bit
      setTimeout(() => onClose(), 500);
      // open a small prompt with the link so developer can copy
      // eslint-disable-next-line no-alert
      alert(`Invite link (demo): ${link}`);
    } catch (err) {
      toast.error('Gagal membuat undangan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-3">Undang Penyewa</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">Nama (opsional)</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-primary-600 text-white">{loading ? 'Membuat...' : 'Buat Undangan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteTenant;
