import React, { useState, useEffect } from 'react';
import { TenantLayout } from '../../components/TenantLayout';
import { Plus, FileText, MessageCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { complaintService } from '../../services/complaintService';
import { Complaint, ComplaintResponse } from '../../types';
import { ComplaintChat } from '../../components/ComplaintChat';

export const TenantComplaintsPage: React.FC = () => {
  const [complaintText, setComplaintText] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [responses, setResponses] = useState<Record<number, ComplaintResponse[]>>({});
  const [responsesLoading, setResponsesLoading] = useState<Record<number, boolean>>({});
  const [showChatModal, setShowChatModal] = useState<number | null>(null);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setIsLoading(true);
        const data = await complaintService.getTenantComplaints();
        setComplaints(data);
      } catch (error: any) {
        console.error('Failed to load complaints', error);
        toast.error(error?.response?.data?.message || 'Gagal memuat aduan');
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const loadResponses = async (complaintId: number) => {
    if (responses[complaintId]) return;
    setResponsesLoading((prev) => ({ ...prev, [complaintId]: true }));
    try {
      const data = await complaintService.getComplaintResponses(complaintId, 'tenant');
      setResponses((prev) => ({ ...prev, [complaintId]: data }));
    } catch (error: any) {
      console.error('Failed to load responses', error);
      toast.error(error?.response?.data?.message || 'Gagal memuat balasan');
    } finally {
      setResponsesLoading((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const openChat = (complaintId: number) => {
    setShowChatModal(complaintId);
    loadResponses(complaintId);
  };

  const closeChat = () => {
    setShowChatModal(null);
  };

  const handleResponseAdded = (complaintId: number, response: ComplaintResponse) => {
    setResponses((prev) => ({
      ...prev,
      [complaintId]: [response, ...(prev[complaintId] || [])],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      toast.error('Mohon isi aduan terlebih dahulu');
      return;
    }

    const title = complaintText.split('\n')[0] || 'Aduan Baru';

    try {
      if (editingComplaint) {
        const updated = await complaintService.updateTenantComplaint(editingComplaint.id, {
          title,
          description: complaintText,
        });

        setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setEditingComplaint(null);
        toast.success('Aduan berhasil diperbarui');
      } else {
        const created = await complaintService.createTenantComplaint({
          title,
          description: complaintText,
        });

        setComplaints((prev) => [created, ...prev]);
        toast.success('Aduan berhasil dikirim');
      }

      setComplaintText('');
    } catch (error: any) {
      console.error('Failed to submit complaint', error);
      toast.error(error?.response?.data?.message || 'Gagal menyimpan aduan');
    }
  };

  const handleEdit = (complaint: Complaint) => {
    if (complaint.status !== 'pending') {
      toast.error('Aduan yang sedang diproses atau selesai tidak dapat diubah');
      return;
    }

    setEditingComplaint(complaint);
    setComplaintText(complaint.description);
  };

  const handleDelete = async (complaint: Complaint) => {
    if (complaint.status !== 'pending') {
      toast.error('Aduan yang sedang diproses atau selesai tidak dapat dihapus');
      return;
    }

    const confirmed = window.confirm('Yakin ingin menghapus aduan ini?');
    if (!confirmed) return;

    try {
      await complaintService.deleteTenantComplaint(complaint.id);
      setComplaints((prev) => prev.filter((c) => c.id !== complaint.id));

      if (editingComplaint && editingComplaint.id === complaint.id) {
        setEditingComplaint(null);
        setComplaintText('');
      }

      toast.success('Aduan berhasil dihapus');
    } catch (error: any) {
      console.error('Failed to delete complaint', error);
      toast.error(error?.response?.data?.message || 'Gagal menghapus aduan');
    }
  };

  return (
    <TenantLayout>
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Aduan</h2>
          </div>
        </div>

        {/* Add Complaint Form */}
        <div className="mb-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingComplaint ? 'Edit Aduan' : 'Tulis Aduan Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isi Aduan
              </label>
              <textarea 
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Tuliskan aduan Anda di sini..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              {editingComplaint && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingComplaint(null);
                    setComplaintText('');
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
                {editingComplaint ? 'Simpan Perubahan' : 'Kirim Aduan'}
              </button>
            </div>
          </form>
        </div>

        {/* Complaint List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Aduan Anda</h3>
          {isLoading && complaints.length === 0 && (
            <p className="text-sm text-gray-500 mb-4">Memuat aduan...</p>
          )}
          {complaints.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada aduan. Tulis aduan pertama Anda di atas.</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{complaint.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{complaint.description}</p>
                    <p className="text-xs text-gray-500">
                      Tanggal: {new Date(complaint.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(complaint)}
                    disabled={complaint.status !== 'pending'}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(complaint)}
                    disabled={complaint.status !== 'pending'}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => openChat(complaint.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      complaint.status === 'resolved'
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                    }`}
                    disabled={complaint.status === 'resolved'}
                  >
                    <MessageCircle className="w-4 h-4 inline mr-1" />
                    {complaint.status === 'resolved' ? 'Chat Ditutup' : 'Buka Chat'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Chat Aduan</h2>
              <button
                onClick={closeChat}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {(() => {
                const complaint = complaints.find(c => c.id === showChatModal);
                if (!complaint) return null;
                return (
                  <ComplaintChat
                    complaintId={complaint.id}
                    complaintTitle={complaint.title}
                    complaintDescription={complaint.description}
                    tenantName="Anda"
                    role="tenant"
                    status={complaint.status}
                    responses={responses[complaint.id] || []}
                    isLoading={responsesLoading[complaint.id]}
                    onResponseAdded={(response: ComplaintResponse) => {
                      setResponses(prev => ({
                        ...prev,
                        [complaint.id]: [...(prev[complaint.id] || []), response]
                      }));
                    }}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </TenantLayout>
  );
};

