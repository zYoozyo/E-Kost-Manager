import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { FileText, Search, MessageCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { complaintService, OwnerComplaint } from '../../services/complaintService';
import { ComplaintResponse } from '../../types';
import { ComplaintChat } from '../../components/ComplaintChat';

export const AdminComplaintsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [complaints, setComplaints] = useState<OwnerComplaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<number, ComplaintResponse[]>>({});
  const [responsesLoading, setResponsesLoading] = useState<Record<number, boolean>>({});
  const [showChatModal, setShowChatModal] = useState<number | null>(null);

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await complaintService.getAdminComplaints();
        setComplaints(data);
      } catch (err: any) {
        console.error('Failed to load admin complaints', err);
        setError(err?.response?.data?.message || 'Gagal memuat aduan');
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaints();
  }, []);

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

  const loadResponses = async (complaintId: number) => {
    if (responses[complaintId]) return;
    setResponsesLoading((prev) => ({ ...prev, [complaintId]: true }));
    try {
      const data = await complaintService.getComplaintResponses(complaintId, 'admin');
      setResponses((prev) => ({ ...prev, [complaintId]: data }));
    } catch (error: any) {
      console.error('Failed to load responses', error);
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

  const handleStatusChange = async (
    complaint: OwnerComplaint,
    newStatus: 'pending' | 'in_progress' | 'resolved'
  ) => {
    // Prevent changing status from resolved back to pending/in_progress
    if (complaint.status === 'resolved' && newStatus !== 'resolved') {
      toast.error('Aduan yang sudah selesai tidak dapat diubah kembali statusnya');
      return;
    }

    if (newStatus === complaint.status) return;

    setUpdatingId(complaint.id);
    try {
      const updated = await complaintService.updateOwnerComplaintStatus(complaint.id, {
        status: newStatus,
      });

      setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(`Status berhasil diubah ke ${newStatus === 'pending' ? 'Pending' : newStatus === 'in_progress' ? 'Sedang Diproses' : 'Selesai'}`);
    } catch (err: any) {
      console.error('Failed to update complaint status', err);
      toast.error(err?.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-orange-500 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Aduan Penyewa</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Cari aduan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px]"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">Sedang Diproses</option>
              <option value="resolved">Selesai</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2.5 sm:space-y-3">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex-1 min-w-0">{complaint.title}</h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`inline-flex px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status === 'in_progress' ? 'Diproses' : complaint.status === 'resolved' ? 'Selesai' : complaint.status}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <span>Penyewa: {complaint.tenantName}</span>
                  <span>Tanggal: {complaint.date}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => openChat(complaint.id)}
                    className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[36px] touch-manipulation ${
                      complaint.status === 'resolved'
                        ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        : 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                    }`}
                    disabled={complaint.status === 'resolved'}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{complaint.status === 'resolved' ? 'Chat Ditutup' : 'Buka Chat'}</span>
                  </button>
                  <select
                    value={complaint.status}
                    onChange={(e) =>
                      handleStatusChange(
                        complaint,
                        e.target.value as 'pending' | 'in_progress' | 'resolved'
                      )
                    }
                    disabled={updatingId === complaint.id || complaint.status === 'resolved'}
                    className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border rounded-lg transition-colors min-h-[36px] ${
                      complaint.status === 'resolved'
                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400'
                    }`}
                  >
                    {complaint.status === 'resolved' ? (
                      <option value="resolved">Selesai (Final)</option>
                    ) : (
                      <>
                        <option value="pending">Pending</option>
                        <option value="in_progress">Sedang Diproses</option>
                        <option value="resolved">Selesai</option>
                      </>
                    )}
                  </select>
                  {complaint.status === 'resolved' && (
                    <div className="relative group">
                      <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Aduan yang sudah selesai tidak dapat diubah kembali statusnya
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && filteredComplaints.length === 0 && (
            <p className="text-sm text-gray-500">Memuat aduan...</p>
          )}
          {!isLoading && filteredComplaints.length === 0 && (
            <p className="text-sm text-gray-500">Belum ada aduan dari penyewa.</p>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block space-y-4">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status === 'in_progress' ? 'Diproses' : complaint.status === 'resolved' ? 'Selesai' : complaint.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Penyewa: {complaint.tenantName}</span>
                    <span>Tanggal: {complaint.date}</span>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => openChat(complaint.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                        complaint.status === 'resolved'
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : 'border border-orange-200 text-orange-600 hover:bg-orange-50'
                      }`}
                      disabled={complaint.status === 'resolved'}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {complaint.status === 'resolved' ? 'Chat Ditutup' : 'Buka Chat'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={complaint.status}
                    onChange={(e) =>
                      handleStatusChange(
                        complaint,
                        e.target.value as 'pending' | 'in_progress' | 'resolved'
                      )
                    }
                    disabled={updatingId === complaint.id || complaint.status === 'resolved'}
                    className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                      complaint.status === 'resolved'
                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400'
                    }`}
                  >
                    {complaint.status === 'resolved' ? (
                      <option value="resolved">Selesai (Final)</option>
                    ) : (
                      <>
                        <option value="pending">Pending</option>
                        <option value="in_progress">Sedang Diproses</option>
                        <option value="resolved">Selesai</option>
                      </>
                    )}
                  </select>
                  {complaint.status === 'resolved' && (
                    <div className="relative group">
                      <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Aduan yang sudah selesai tidak dapat diubah kembali statusnya
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && filteredComplaints.length === 0 && (
            <p className="text-sm text-gray-500">Memuat aduan...</p>
          )}
          {!isLoading && filteredComplaints.length === 0 && (
            <p className="text-sm text-gray-500">Belum ada aduan dari penyewa.</p>
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
                    tenantName={complaint.tenantName}
                    role="admin"
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
    </AdminLayout>
  );
};

