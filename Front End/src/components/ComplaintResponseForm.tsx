import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { complaintService } from '../services/complaintService';
import { ComplaintResponse } from '../types';

interface ComplaintResponseFormProps {
  complaintId: number;
  role: 'tenant' | 'admin';
  onResponseAdded: (response: ComplaintResponse) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ComplaintResponseForm({
  complaintId,
  role,
  onResponseAdded,
  disabled = false,
  placeholder = 'Tulis balasan Anda...',
}: ComplaintResponseFormProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Pesan tidak boleh kosong');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await complaintService.addComplaintResponse(complaintId, { message }, role);
      setMessage('');
      onResponseAdded(response);
      toast.success('Balasan berhasil dikirim');
    } catch (error: any) {
      console.error('Error sending response:', error);
      toast.error(error?.response?.data?.message || 'Gagal mengirim balasan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        disabled={disabled || isSubmitting}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          disabled={disabled || isSubmitting}
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Balasan'}
        </button>
      </div>
    </form>
  );
}
