import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { CreditCard, Search, Download, RefreshCw, Eye, CheckCircle, XCircle, X } from 'lucide-react';
import {
  paymentService,
  PaymentStatus,
  OwnerPaymentApi,
  OwnerPaymentSummary,
} from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const statusOptions: { value: 'all' | PaymentStatus; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'waiting_verification', label: 'Menunggu Verifikasi' },
  { value: 'paid', label: 'Lunas' },
  { value: 'late', label: 'Terlambat' },
  { value: 'rejected', label: 'Ditolak' },
];

const statusBadge: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  waiting_verification: {
    label: 'Menunggu Verifikasi',
    color: 'bg-sky-100 text-sky-800',
  },
  paid: { label: 'Lunas', color: 'bg-green-100 text-green-800' },
  late: { label: 'Terlambat', color: 'bg-red-100 text-red-800' },
  rejected: { label: 'Ditolak', color: 'bg-gray-200 text-gray-700' },
};

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export const AdminPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PaymentStatus>('all');
  const [payments, setPayments] = useState<OwnerPaymentApi[]>([]);
  const [summary, setSummary] = useState<OwnerPaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedPaymentForProof, setSelectedPaymentForProof] = useState<OwnerPaymentApi | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      // Only clear fetch errors, not role access errors
      if (error !== 'Role tidak dikenali untuk akses pembayaran') {
        setError(null);
      }

      const result = await paymentService.getAdminPayments({
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: debouncedSearch || undefined,
        per_page: 50,
      });

      setPayments(result.payments);
      setSummary(result.summary);
    } catch (err: any) {
      console.error('Failed to load payments', err);
      // Only set fetch error if it's not a role access error
      if (error !== 'Role tidak dikenali untuk akses pembayaran') {
        setError(err?.response?.data?.message || 'Gagal memuat data pembayaran');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('User data:', user); // Debug: cek struktur data user
    console.log('User role:', user?.role); // Debug: cek role user
    
    // Allow only admin role to access payments page
    if (user && user.role === 'admin') {
      console.log('Admin detected, fetching payments...');
      fetchPayments();
    } else if (user && user.role !== 'admin') {
      // For non-admin roles, block access and show error
      console.log('Non-admin role detected:', user.role);
      setError('Role tidak dikenali untuk akses pembayaran');
      setPayments([]); // Clear payments data
      setSummary(null); // Clear summary data
      setIsLoading(false);
    } else if (!user) {
      // If no user data yet, don't show error, just wait
      console.log('No user data yet, waiting...');
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterStatus, user]);

  const totalAmount = useMemo(() => {
    return payments.reduce((sum, payment) => sum + (payment.nominal_tagihan ?? 0), 0);
  }, [payments]);

  const renderStatusBadge = (status: PaymentStatus) => {
    const badge = statusBadge[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getDueDateStatus = (dueDate: string | null, status: PaymentStatus) => {
    if (!dueDate || status === 'paid') return { text: '-', color: 'text-gray-500' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) {
      return { 
        text: `${due.toLocaleDateString('id-ID')} (Terlambat ${Math.abs(daysUntilDue)} hari)`, 
        color: 'text-red-600 font-semibold' 
      };
    } else if (daysUntilDue === 0) {
      return { 
        text: `${due.toLocaleDateString('id-ID')} (Jatuh Tempo Hari Ini)`, 
        color: 'text-orange-600 font-semibold' 
      };
    } else if (daysUntilDue <= 3) {
      return { 
        text: `${due.toLocaleDateString('id-ID')} (${daysUntilDue} hari lagi)`, 
        color: 'text-yellow-600 font-semibold' 
      };
    } else {
      return { 
        text: `${due.toLocaleDateString('id-ID')} (${daysUntilDue} hari lagi)`, 
        color: 'text-gray-600' 
      };
    }
  };

  const handleUpdateStatus = async (payment: OwnerPaymentApi, status: PaymentStatus) => {
    try {
      setUpdatingId(payment.id);
      const updated = await paymentService.updatePayment(payment.id, { status });

      setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

      const label = statusBadge[status]?.label ?? status;
      toast.success(`Status pembayaran diubah menjadi "${label}"`);
    } catch (err: any) {
      console.error('Failed to update payment status', err);
      toast.error(err?.response?.data?.message || 'Gagal mengubah status pembayaran');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGenerateInvoices = async () => {
    try {
      setIsGenerating(true);
      const result = await paymentService.generateMonthlyInvoices();
      
      toast.success(`Berhasil generate ${result.created} tagihan baru!`);
      
      // Refresh data setelah generate
      await fetchPayments();
    } catch (err: any) {
      console.error('Failed to generate invoices', err);
      toast.error(err?.response?.data?.message || 'Gagal generate tagihan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    try {
      if (payments.length === 0) {
        toast.error('Tidak ada data untuk diekspor');
        return;
      }

      // Prepare data for export
      const exportData = payments.map((payment) => {
        const dueDate = payment.due_date 
          ? new Date(payment.due_date).toLocaleDateString('id-ID')
          : '-';
        
        return {
          'No Faktur': payment.invoice_code,
          'Penyewa': payment.tenant?.name || '-',
          'Kost': payment.kamar?.kost?.nama_kost || '-',
          'Kamar': payment.kamar?.nomor_kamar || '-',
          'Nominal Tagihan': `Rp ${payment.nominal_tagihan.toLocaleString('id-ID')}`,
          'Status': statusBadge[payment.status]?.label || payment.status,
          'Jatuh Tempo': dueDate,
          'Tanggal Dibuat': new Date(payment.created_at).toLocaleDateString('id-ID'),
        };
      });

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        ),
      ].join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `pembayaran_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast.success('Data pembayaran berhasil diekspor');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor data pembayaran');
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-green-500 rounded-lg">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Pembayaran</h2>
          </div>
          
          {/* Search, Filter, and Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="md:col-span-4 lg:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Cari penyewa / kost"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="md:col-span-3 lg:col-span-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | PaymentStatus)}
                className="w-full px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="md:col-span-5 lg:col-span-5 flex items-center gap-2 sm:gap-3 justify-end">
              <button
                onClick={fetchPayments}
                className="px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </button>
              <button 
                onClick={handleExport}
                disabled={payments.length === 0 || isLoading}
                className="px-3 sm:px-4 py-2.5 text-sm sm:text-base bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>

        {!user && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Memuat Data User...</h3>
            <p className="text-sm text-gray-500">
              Sedang memuat informasi user
            </p>
          </div>
        )}

        {error && error === 'Role tidak dikenali untuk akses pembayaran' && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {error && error !== 'Role tidak dikenali untuk akses pembayaran' && user?.role === 'admin' && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && payments.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Data Pembayaran</h3>
            <p className="text-sm text-gray-500">
              Tagihan akan otomatis muncul saat tenant assign ke kamar
            </p>
          </div>
        )}

        {user && user.role === 'admin' && error !== 'Role tidak dikenali untuk akses pembayaran' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Total Pembayaran (list)</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{currencyFormatter.format(totalAmount)}</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600">Lunas Bulan Ini</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {currencyFormatter.format(summary?.paid_this_month ?? 0)}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg sm:col-span-2 md:col-span-1">
                <p className="text-xs sm:text-sm text-gray-600">Tagihan Jatuh Tempo Bulan Ini</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {currencyFormatter.format(summary?.total_due_this_month ?? 0)}
                </p>
              </div>
            </div>

            {/* Mobile Card View - Responsive */}
            <div className="md:hidden space-y-2.5 sm:space-y-3">
              {payments.map((payment) => {
                const dueDateStatus = getDueDateStatus(payment.due_date, payment.status);
                const isOverdue = payment.due_date && new Date(payment.due_date) < new Date() && payment.status !== 'paid';
                const isDueSoon = payment.due_date && payment.status !== 'paid';
                const daysUntilDue = payment.due_date ? Math.ceil((new Date(payment.due_date).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)) : 0;
                const checkDueSoon = isDueSoon && daysUntilDue >= 0 && daysUntilDue <= 3;
                
                return (
                  <div
                    key={payment.id}
                    className={`p-3 sm:p-4 bg-white border rounded-lg ${
                      isOverdue ? 'border-red-200 bg-red-50' : checkDueSoon ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{payment.tenant?.name ?? 'Tidak diketahui'}</p>
                        <p className="text-xs text-gray-500 truncate">{payment.kamar?.kost?.nama_kost ?? '-'} - Kamar {payment.kamar?.nomor_kamar ?? '-'}</p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {renderStatusBadge(payment.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2 mb-2.5 sm:mb-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Jumlah:</span>
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">{currencyFormatter.format(payment.nominal_tagihan ?? 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Jatuh Tempo:</span>
                        <span className={`text-xs sm:text-sm ${dueDateStatus.color}`}>{dueDateStatus.text}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 border-t border-gray-200">
                      {payment.bukti_pembayaran_url && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPaymentForProof(payment);
                            setShowProofModal(true);
                          }}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 min-h-[36px] touch-manipulation"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Lihat Bukti</span>
                        </button>
                      )}
                      {payment.status === 'waiting_verification' && (
                        <>
                          <button
                            type="button"
                            disabled={updatingId === payment.id}
                            onClick={() => handleUpdateStatus(payment, 'paid')}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 min-h-[36px] touch-manipulation"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">Setujui</span>
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === payment.id}
                            onClick={() => handleUpdateStatus(payment, 'rejected')}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 min-h-[36px] touch-manipulation"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <XCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">Tolak</span>
                          </button>
                        </>
                      )}
                      {payment.status !== 'paid' && payment.status !== 'waiting_verification' && (
                        <button
                          type="button"
                          disabled={updatingId === payment.id}
                          onClick={() => handleUpdateStatus(payment, 'paid')}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 min-h-[36px] touch-manipulation"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Tandai Lunas</span>
                        </button>
                      )}
                      {payment.status !== 'rejected' && payment.status !== 'paid' && payment.status !== 'waiting_verification' && (
                        <button
                          type="button"
                          disabled={updatingId === payment.id}
                          onClick={() => handleUpdateStatus(payment, 'rejected')}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 min-h-[36px] touch-manipulation"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <XCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Tolak</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penyewa
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kost
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kamar
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jatuh Tempo
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => {
                      const dueDateStatus = getDueDateStatus(payment.due_date, payment.status);
                      const isOverdue = payment.due_date && new Date(payment.due_date) < new Date() && payment.status !== 'paid';
                      const isDueSoon = payment.due_date && payment.status !== 'paid';
                      const daysUntilDue = payment.due_date ? Math.ceil((new Date(payment.due_date).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)) : 0;
                      const checkDueSoon = isDueSoon && daysUntilDue >= 0 && daysUntilDue <= 3;
                      
                      return (
                        <tr key={payment.id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : checkDueSoon ? 'bg-yellow-50' : ''}`}>
                          <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.tenant?.name ?? 'Tidak diketahui'}
                          </td>
                          <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            {payment.kamar?.kost?.nama_kost ?? '-'}
                          </td>
                          <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            {payment.kamar?.nomor_kamar ?? '-'}
                          </td>
                          <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {currencyFormatter.format(payment.nominal_tagihan ?? 0)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                            {renderStatusBadge(payment.status)}
                          </td>
                          <td className={`px-4 lg:px-6 py-3 whitespace-nowrap text-sm ${dueDateStatus.color}`}>
                            {dueDateStatus.text}
                          </td>
                          <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-xs text-gray-700">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Tombol Lihat Bukti - hanya muncul jika ada bukti */}
                              {payment.bukti_pembayaran_url && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPaymentForProof(payment);
                                    setShowProofModal(true);
                                  }}
                                  className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs"
                                  title="Lihat Bukti Pembayaran"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Lihat Bukti</span>
                                  <span className="lg:hidden">Bukti</span>
                                </button>
                              )}
                              
                              {/* Tombol Verifikasi - hanya untuk status waiting_verification */}
                              {payment.status === 'waiting_verification' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={updatingId === payment.id}
                                    onClick={() => handleUpdateStatus(payment, 'paid')}
                                    className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 text-xs"
                                    title="Setujui Pembayaran"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    <span className="hidden lg:inline">Setujui</span>
                                    <span className="lg:hidden">✓</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={updatingId === payment.id}
                                    onClick={() => handleUpdateStatus(payment, 'rejected')}
                                    className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 text-xs"
                                    title="Tolak Pembayaran"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    <span className="hidden lg:inline">Tolak</span>
                                    <span className="lg:hidden">✗</span>
                                  </button>
                                </>
                              )}
                            
                              {/* Tombol untuk status lain */}
                              {payment.status !== 'paid' && payment.status !== 'waiting_verification' && (
                                <button
                                  type="button"
                                  disabled={updatingId === payment.id}
                                  onClick={() => handleUpdateStatus(payment, 'paid')}
                                  className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 text-xs"
                                  title="Tandai Lunas"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Tandai Lunas</span>
                                  <span className="lg:hidden">Lunas</span>
                                </button>
                              )}
                              {payment.status !== 'rejected' && payment.status !== 'paid' && payment.status !== 'waiting_verification' && (
                                <button
                                  type="button"
                                  disabled={updatingId === payment.id}
                                  onClick={() => handleUpdateStatus(payment, 'rejected')}
                                  className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 text-xs"
                                  title="Tolak Pembayaran"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  <span className="hidden lg:inline">Tolak</span>
                                  <span className="lg:hidden">✗</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {isLoading && (
              <p className="mt-4 text-sm text-gray-500">Memuat data pembayaran...</p>
            )}

            {!isLoading && payments.length === 0 && (
              <p className="mt-4 text-sm text-gray-500">Belum ada data pembayaran.</p>
            )}
          </>
        )}
      </div>

      {/* Modal Lihat Bukti Pembayaran */}
      {showProofModal && selectedPaymentForProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                <span className="hidden sm:inline">Bukti Pembayaran</span>
                <span className="sm:hidden">Bukti</span>
              </h2>
              <button
                onClick={() => {
                  setShowProofModal(false);
                  setSelectedPaymentForProof(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">No. Faktur</p>
                    <p className="font-semibold text-gray-900">{selectedPaymentForProof.invoice_code}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Penyewa</p>
                    <p className="font-semibold text-gray-900">{selectedPaymentForProof.tenant?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Nominal Tagihan</p>
                    <p className="font-semibold text-gray-900">
                      {currencyFormatter.format(selectedPaymentForProof.nominal_tagihan ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Nominal Dibayar</p>
                    <p className="font-semibold text-gray-900">
                      {selectedPaymentForProof.nominal_dibayar 
                        ? currencyFormatter.format(selectedPaymentForProof.nominal_dibayar)
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Bukti Transfer</p>
                {selectedPaymentForProof.bukti_pembayaran_url ? (
                  <div className="border-2 border-gray-200 rounded-lg p-2 sm:p-4 bg-gray-50">
                    {selectedPaymentForProof.bukti_pembayaran_url.toLowerCase().endsWith('.pdf') ? (
                      <div className="text-center py-4 sm:py-8">
                        <p className="text-gray-600 mb-3 sm:mb-4 text-sm">File PDF</p>
                        <a
                          href={selectedPaymentForProof.bukti_pembayaran_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Buka PDF
                        </a>
                      </div>
                    ) : (
                      <img
                        src={selectedPaymentForProof.bukti_pembayaran_url}
                        alt="Bukti Pembayaran"
                        className="w-full rounded-lg shadow-md"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                          if (errorDiv) errorDiv.style.display = 'block';
                        }}
                      />
                    )}
                    <div style={{ display: 'none' }} className="text-center py-8 text-red-600">
                      <p>Gagal memuat gambar</p>
                      <a
                        href={selectedPaymentForProof.bukti_pembayaran_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline mt-2 inline-block"
                      >
                        Buka di tab baru
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Bukti pembayaran tidak tersedia</p>
                )}
              </div>
            </div>

            {/* Tombol Verifikasi */}
            {selectedPaymentForProof.status === 'waiting_verification' && (
              <div className="flex gap-3 pt-6 border-t">
                <button
                  onClick={async () => {
                    try {
                      setUpdatingId(selectedPaymentForProof.id);
                      await paymentService.updatePayment(selectedPaymentForProof.id, { status: 'paid' });
                      toast.success('Pembayaran disetujui!');
                      setShowProofModal(false);
                      setSelectedPaymentForProof(null);
                      fetchPayments();
                    } catch (err: any) {
                      toast.error(err?.response?.data?.message || 'Gagal menyetujui pembayaran');
                    } finally {
                      setUpdatingId(null);
                    }
                  }}
                  disabled={updatingId === selectedPaymentForProof.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Setujui Pembayaran
                </button>
                <button
                  onClick={async () => {
                    try {
                      setUpdatingId(selectedPaymentForProof.id);
                      await paymentService.updatePayment(selectedPaymentForProof.id, { status: 'rejected' });
                      toast.success('Pembayaran ditolak');
                      setShowProofModal(false);
                      setSelectedPaymentForProof(null);
                      fetchPayments();
                    } catch (err: any) {
                      toast.error(err?.response?.data?.message || 'Gagal menolak pembayaran');
                    } finally {
                      setUpdatingId(null);
                    }
                  }}
                  disabled={updatingId === selectedPaymentForProof.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Tolak Pembayaran
                </button>
                <button
                  onClick={() => {
                    setShowProofModal(false);
                    setSelectedPaymentForProof(null);
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            )}

            {selectedPaymentForProof.status !== 'waiting_verification' && (
              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={() => {
                    setShowProofModal(false);
                    setSelectedPaymentForProof(null);
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};