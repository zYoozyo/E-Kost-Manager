import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { CreditCard, Search, Download, RefreshCw } from 'lucide-react';
import {
  paymentService,
  PaymentStatus,
  OwnerPaymentApi,
  OwnerPaymentSummary,
} from '../../services/paymentService';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PaymentStatus>('all');
  const [payments, setPayments] = useState<OwnerPaymentApi[]>([]);
  const [summary, setSummary] = useState<OwnerPaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await paymentService.getOwnerPayments({
        status: filterStatus === 'all' ? undefined : filterStatus,
        search: debouncedSearch || undefined,
        per_page: 50,
      });

      setPayments(result.payments);
      setSummary(result.summary);
    } catch (err: any) {
      console.error('Failed to load payments', err);
      setError(err?.response?.data?.message || 'Gagal memuat data pembayaran');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterStatus]);

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

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Pembayaran</h2>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari penyewa / kost"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | PaymentStatus)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={fetchPayments}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {error && (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Pembayaran (list)</p>
            <p className="text-2xl font-bold text-gray-900">{currencyFormatter.format(totalAmount)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Lunas Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-900">
              {currencyFormatter.format(summary?.paid_this_month ?? 0)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Tagihan Jatuh Tempo Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-900">
              {currencyFormatter.format(summary?.total_due_this_month ?? 0)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penyewa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kamar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jatuh Tempo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.tenant?.name ?? 'Tidak diketahui'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.kamar?.kost?.nama_kost ?? '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.kamar?.nomor_kamar ?? '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {currencyFormatter.format(payment.nominal_tagihan ?? 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(payment.status)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${dueDateStatus.color}`}>
                      {dueDateStatus.text}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700 space-x-2">
                      {payment.status !== 'paid' && (
                        <button
                          type="button"
                          disabled={updatingId === payment.id}
                          onClick={() => handleUpdateStatus(payment, 'paid')}
                          className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                        >
                          Tandai Lunas
                        </button>
                      )}
                      {payment.status !== 'rejected' && payment.status !== 'paid' && (
                        <button
                          type="button"
                          disabled={updatingId === payment.id}
                          onClick={() => handleUpdateStatus(payment, 'rejected')}
                          className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          Tolak
                        </button>
                      )}
                      {payment.status === 'paid' && (
                        <button
                          type="button"
                          disabled={updatingId === payment.id}
                          onClick={() => handleUpdateStatus(payment, 'pending')}
                          className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                          Set Pending
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <p className="mt-4 text-sm text-gray-500">Memuat data pembayaran...</p>
        )}

        {!isLoading && payments.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">Belum ada data pembayaran.</p>
        )}
      </div>
    </AdminLayout>
  );
};

