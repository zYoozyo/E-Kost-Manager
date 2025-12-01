import React, { useState, useEffect } from 'react';
import { TenantLayout } from '../../components/TenantLayout';
import { Plus, Printer, QrCode, X, Eye, CreditCard, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { paymentService, PaymentHistoryItem } from '../../services/paymentService';
import { ownerPaymentSettingsService, TenantPaymentSettings } from '../../services/ownerPaymentSettingsService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const TenantPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [qrisString, setQrisString] = useState<string>('');
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [payments, setPayments] = useState<{
    id: number;
    noFaktur: string;
    periode: string;
    tanggalTempo: string;
    tanggalTempoColor: string;
    isOverdue: boolean;
    isDueSoon: boolean;
    daysUntilDue: number;
    status: string;
    jumlah: string;
    amount: number;
    metode: string;
  }[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantPaymentSettings, setTenantPaymentSettings] = useState<TenantPaymentSettings | null>(null);

  // Cleanup polling saat modal ditutup atau komponen unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Stop polling saat modal ditutup
  useEffect(() => {
    if (!showQrisModal && pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [showQrisModal, pollingInterval]);

  // Load payment history from backend
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoadingList(true);
        setError(null);

        const [history, paymentSettings] = await Promise.all([
          paymentService.getPaymentHistory(),
          ownerPaymentSettingsService.getForTenant(),
        ]);

        const mapped = history.map((p: PaymentHistoryItem) => {
          const startDate = new Date(p.periode_mulai);
          
          // Calculate due date: exactly 30 days (1 month) from periode_mulai
          const dueDate = new Date(startDate);
          dueDate.setDate(dueDate.getDate() + 30); // Add exactly 30 days
          
          const monthYear = startDate.toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
          });

          // Calculate days until due date
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          // Format due date with relative time
          let dueDateFormatted = dueDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          
          let dueDateStatus = '';
          let dueDateColor = '';
          
          if (p.status !== 'paid') {
            if (daysUntilDue < 0) {
              dueDateStatus = `Terlambat ${Math.abs(daysUntilDue)} hari`;
              dueDateColor = 'text-red-600 font-semibold';
            } else if (daysUntilDue === 0) {
              dueDateStatus = 'Jatuh Tempo Hari Ini';
              dueDateColor = 'text-orange-600 font-semibold';
            } else if (daysUntilDue <= 3) {
              dueDateStatus = `${daysUntilDue} hari lagi`;
              dueDateColor = 'text-yellow-600 font-semibold';
            } else {
              dueDateStatus = `${daysUntilDue} hari lagi`;
              dueDateColor = 'text-gray-600';
            }
            dueDateFormatted += ` (${dueDateStatus})`;
          }

          return {
            id: p.id,
            noFaktur: p.invoice_code,
            periode: monthYear,
            tanggalTempo: dueDateFormatted,
            tanggalTempoColor: dueDateColor,
            isOverdue: p.status !== 'paid' && daysUntilDue < 0,
            isDueSoon: p.status !== 'paid' && daysUntilDue >= 0 && daysUntilDue <= 3,
            daysUntilDue: daysUntilDue,
            status: p.status === 'paid' ? 'Lunas' : 'Belum Lunas',
            jumlah: `Rp ${p.nominal_tagihan.toLocaleString('id-ID')}`,
            amount: p.nominal_tagihan,
            metode: p.metode_pembayaran,
          };
        });

        setPayments(mapped);
        setTenantPaymentSettings(paymentSettings);
      } catch (err: any) {
        console.error('Failed to load payment history', err);
        setError(err?.response?.data?.message || 'Gagal memuat riwayat pembayaran');
      } finally {
        setIsLoadingList(false);
      }
    };

    loadPayments();
  }, []);

  // Polling untuk check payment status
  const startPaymentPolling = (invoiceId: string): number => {
    let pollCount = 0;
    const maxPolls = 60; // Poll selama 5 menit (60 x 5 detik)
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      
      try {
        const statusResponse = await paymentService.checkPaymentStatus(invoiceId);
        
        if (statusResponse.status === 'paid') {
          clearInterval(pollInterval);
          setPollingInterval(null);
          toast.success('Pembayaran berhasil!');
          setShowQrisModal(false);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else if (statusResponse.status === 'expired' || statusResponse.status === 'failed') {
          clearInterval(pollInterval);
          setPollingInterval(null);
          toast.error('Pembayaran gagal atau expired');
        }
        
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setPollingInterval(null);
          toast.error('Waktu pembayaran habis, silakan coba lagi');
        }
      } catch (error) {
        if (pollCount % 12 === 0) {
          console.log('Polling payment status...', error);
        }
      }
    }, 5000); // Check setiap 5 detik
    
    return pollInterval;
  };

  // Handle Bayar - gunakan instruksi manual & QRIS statis jika tersedia
  const handleBayar = async (payment: any) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  // Handle Detail - buka modal detail invoice
  const handleDetail = (payment: any) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  // Handle Pay from Detail Modal
  const handlePayFromDetail = (payment: any) => {
    setShowDetailModal(false);
    const paymentInfo = tenantPaymentSettings?.payment_settings;

    if (payment.metode === 'qris') {
      if (paymentInfo?.qris_payload) {
        setQrisString(paymentInfo.qris_payload);
        setShowQrisModal(true);
        toast.success('Scan QRIS untuk melakukan pembayaran.');
      } else {
        toast.error('QRIS belum diatur oleh pemilik kost. Silakan hubungi pemilik.');
      }
      return;
    }

    if (payment.metode === 'transfer') {
      if (paymentInfo?.bank_account_number && paymentInfo.bank_name) {
        toast.success('Silakan transfer sesuai informasi rekening yang tertera pada kartu instruksi pembayaran.');
      } else {
        toast.error('Informasi rekening pemilik belum lengkap. Silakan hubungi pemilik kost.');
      }
      return;
    }

    if (payment.metode === 'tunai') {
      toast.success('Silakan lakukan pembayaran tunai langsung kepada pemilik kost.');
      return;
    }

    toast('Silakan ikuti instruksi pembayaran yang disepakati dengan pemilik.');
  };

  // Handle Cetak - Print Struk
  const handleCetak = (payment: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Mohon izinkan pop-up untuk mencetak struk');
      return;
    }

    const strukContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pembayaran - ${payment.noFaktur || payment.id}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 400px; margin: 0 auto; background: white; }
            .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
            .header p { margin-top: 5px; font-size: 14px; }
            .info { margin: 12px 0; padding: 8px 0; border-bottom: 1px dotted #ccc; }
            .info-label { font-weight: bold; display: inline-block; width: 160px; }
            .info-value { display: inline-block; }
            .total { border-top: 3px double #333; padding-top: 15px; margin-top: 25px; text-align: right; }
            .total-amount { font-size: 20px; font-weight: bold; margin-top: 5px; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #ccc; padding-top: 15px; }
            @media print { body { margin: 0; padding: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>E-KOST MANAGER</h1>
            <p>STRUK PEMBAYARAN</p>
          </div>
          <div class="info">
            <span class="info-label">No Faktur:</span>
            <span class="info-value">${payment.noFaktur || payment.id || 'M1-001-123'}</span>
          </div>
          <div class="info">
            <span class="info-label">Periode Sewa:</span>
            <span class="info-value">${payment.periode || '1 Sept-30 Sept 2025'}</span>
          </div>
          <div class="info">
            <span class="info-label">Tanggal Jatuh Tempo:</span>
            <span class="info-value">${payment.tanggalTempo || '30 Sept 2025'}</span>
          </div>
          <div class="info">
            <span class="info-label">Status:</span>
            <span class="info-value">${payment.status === 'Lunas' ? 'LUNAS' : 'BELUM LUNAS'}</span>
          </div>
          <div class="total">
            <div style="font-size: 14px; margin-bottom: 5px;">TOTAL PEMBAYARAN</div>
            <div class="total-amount">${payment.jumlah || 'Rp.650.000,00'}</div>
          </div>
          <div class="footer">
            <p>Terima kasih atas pembayaran Anda</p>
            <p>Struk ini adalah bukti pembayaran yang sah</p>
            <p style="margin-top: 10px;">Dicetak pada: ${new Date().toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(strukContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    };
  };

  return (
    <TenantLayout>
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pembayaran</h2>
          {payments.length > 0 && payments.some(p => p.status === 'pending') && (
            <button 
              onClick={() => {
                const firstPending = payments.find(p => p.status === 'pending');
                if (firstPending) handleBayar(firstPending);
              }}
              className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Bayar Sekarang
            </button>
          )}
        </div>

        {/* Alert untuk pembayaran jatuh tempo/terlambat */}
        {payments.some(p => p.isOverdue || p.isDueSoon) && (
          <div className="mb-6 space-y-3">
            {payments.filter(p => p.isOverdue).map(payment => (
              <div key={payment.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 rounded-full p-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">
                      Pembayaran Terlambat! - {payment.noFaktur}
                    </p>
                    <p className="text-sm text-red-600">
                      Tagihan {payment.periode} terlambat {Math.abs(payment.daysUntilDue)} hari. Segera lakukan pembayaran untuk menghindari denda.
                    </p>
                  </div>
                  <button
                    onClick={() => handleBayar(payment)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold animate-pulse"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            ))}
            {payments.filter(p => p.isDueSoon && !p.isOverdue).map(payment => (
              <div key={payment.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 rounded-full p-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800">
                      Pengingat Pembayaran - {payment.noFaktur}
                    </p>
                    <p className="text-sm text-yellow-600">
                      Tagihan {payment.periode} akan jatuh tempo dalam {payment.daysUntilDue} hari. Segera lakukan pembayaran.
                    </p>
                  </div>
                  <button
                    onClick={() => handleBayar(payment)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {tenantPaymentSettings && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Instruksi Pembayaran</h3>
            {tenantPaymentSettings.payment_settings ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Transfer Bank</p>
                  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 space-y-1">
                    <p>
                      Bank: <span className="font-semibold">{tenantPaymentSettings.payment_settings.bank_name || '-'}</span>
                    </p>
                    <p>
                      No. Rekening:{' '}
                      <span className="font-semibold">
                        {tenantPaymentSettings.payment_settings.bank_account_number || '-'}
                      </span>
                    </p>
                    <p>
                      Atas Nama:{' '}
                      <span className="font-semibold">
                        {tenantPaymentSettings.payment_settings.bank_account_holder || '-'}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">QRIS Pemilik (opsional)</p>
                  <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-center justify-center min-h-[140px]">
                    {tenantPaymentSettings.payment_settings.qris_payload ? (
                      <QRCodeSVG
                        value={tenantPaymentSettings.payment_settings.qris_payload}
                        size={120}
                        level="M"
                        includeMargin={true}
                      />
                    ) : (
                      <p className="text-xs text-gray-500 text-center">
                        QRIS belum diatur oleh pemilik kost.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Pemilik kost belum mengatur informasi pembayaran. Silakan hubungi pemilik untuk detail pembayaran.
              </p>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">No Faktur</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Periode Sewa</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Tanggal Jatuh Tempo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Jumlah</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className={`border-b ${payment.isOverdue ? 'bg-red-50' : payment.isDueSoon ? 'bg-yellow-50' : 'border-gray-200'}`}>
                  <td className="py-3 px-4 text-sm text-gray-900">{payment.noFaktur}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{payment.periode}</td>
                  <td className={`py-3 px-4 text-sm ${payment.tanggalTempoColor}`}>
                    {payment.tanggalTempo}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'Lunas'
                          ? 'bg-green-100 text-green-800'
                          : payment.isOverdue
                          ? 'bg-red-100 text-red-800'
                          : payment.isDueSoon
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{payment.jumlah}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDetail(payment)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Detail
                      </button>
                      {payment.status === 'Lunas' ? (
                        <button
                          onClick={() => handleCetak(payment)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3 h-3" />
                          Cetak
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBayar(payment)}
                          className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                            payment.isOverdue 
                              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          <QrCode className="w-3 h-3" />
                          {payment.isOverdue ? 'DARURAT!' : 'Bayar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoadingList && payments.length === 0 && (
            <p className="text-sm text-gray-500 mt-4">Memuat data pembayaran...</p>
          )}
          {!isLoadingList && payments.length === 0 && !error && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Belum Ada Tagihan Pembayaran</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Anda belum memiliki tagihan pembayaran. Pemilik kost akan generate tagihan bulanan untuk Anda.
                </p>
                <div className="bg-blue-100 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">📝 Informasi Tagihan:</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Tagihan biasanya dibuat setiap awal bulan</li>
                    <li>Anda akan mendapat notifikasi saat tagihan tersedia</li>
                    <li>Hubungi pemilik kost jika ada pertanyaan</li>
                    <li>Pastikan Anda sudah menempati kamar aktif</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Detail Invoice Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-500" />
                Detail Invoice
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-80 mb-1">No. Faktur</p>
                  <p className="text-xl font-bold">{selectedPayment.noFaktur}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedPayment.status === 'Lunas'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedPayment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Periode Sewa</p>
                  <p className="text-sm font-medium text-gray-900">{selectedPayment.periode}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tanggal Jatuh Tempo</p>
                  <p className={`text-sm font-medium ${selectedPayment.tanggalTempoColor || 'text-gray-900'}`}>
                    {selectedPayment.tanggalTempo}
                  </p>
                  {selectedPayment.isOverdue && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs text-red-700 font-semibold">
                        ⚠️ Terlambat {Math.abs(selectedPayment.daysUntilDue)} hari
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Segera lakukan pembayaran untuk menghindari denda atau sanksi
                      </p>
                    </div>
                  )}
                  {selectedPayment.isDueSoon && !selectedPayment.isOverdue && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-700 font-semibold">
                        ⏰ Jatuh tempo dalam {selectedPayment.daysUntilDue} hari
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Lakukan pembayaran sebelum tanggal jatuh tempo
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Metode Pembayaran</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{selectedPayment.metode}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Tagihan</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedPayment.jumlah}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Penyewa</p>
                  <p className="text-sm font-medium text-gray-900">{user?.name || '-'}</p>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            {tenantPaymentSettings?.payment_settings && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Instruksi Pembayaran
                </h3>

                {selectedPayment.metode === 'transfer' && tenantPaymentSettings.payment_settings.bank_name && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Transfer Bank</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bank</span>
                        <span className="text-sm font-bold text-gray-900">{tenantPaymentSettings.payment_settings.bank_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">No. Rekening</span>
                        <span className="text-sm font-mono font-bold text-gray-900">{tenantPaymentSettings.payment_settings.bank_account_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Atas Nama</span>
                        <span className="text-sm font-bold text-gray-900">{tenantPaymentSettings.payment_settings.bank_account_holder}</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Catatan:</strong> Transfer sesuai jumlah tagihan dan sertakan nomor faktur <strong>{selectedPayment.noFaktur}</strong> pada berita transfer.
                      </p>
                    </div>
                  </div>
                )}

                {selectedPayment.metode === 'qris' && tenantPaymentSettings.payment_settings.qris_payload && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">QRIS</h4>
                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <QRCodeSVG
                          value={tenantPaymentSettings.payment_settings.qris_payload}
                          size={160}
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        <strong>Catatan:</strong> Scan QR code di atas dengan aplikasi e-wallet Anda. Pastikan jumlah sesuai tagihan.
                      </p>
                    </div>
                  </div>
                )}

                {selectedPayment.metode === 'tunai' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Pembayaran Tunai</h4>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-800">
                        <strong>Catatan:</strong> Silakan lakukan pembayaran tunai langsung kepada pemilik kost. Simpan bukti pembayaran jika ada.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              {selectedPayment.status !== 'Lunas' && (
                <button
                  onClick={() => handlePayFromDetail(selectedPayment)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Bayar Sekarang
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QRIS Payment Modal */}
      {showQrisModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pembayaran QRIS</h2>
              <button
                onClick={() => {
                  if (pollingInterval) {
                    clearInterval(pollingInterval);
                    setPollingInterval(null);
                  }
                  setShowQrisModal(false);
                  setQrisString('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block mb-4">
                {isLoadingPayment ? (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-600">Membuat QRIS...</p>
                    </div>
                  </div>
                ) : qrisString ? (
                  <>
                    <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
                      <QRCodeSVG
                        value={qrisString}
                        size={256}
                        level="H"
                        includeMargin={true}
                        fgColor="#000000"
                        bgColor="#FFFFFF"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Scan QR Code dengan</p>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Aplikasi E-Wallet</p>
                    <div className="text-xs text-gray-400 break-all p-2 bg-gray-50 rounded max-w-xs">
                      {qrisString}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Gagal memuat QRIS</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-600">No Faktur: <span className="font-semibold text-gray-900">{selectedPayment.noFaktur}</span></p>
                <p className="text-lg font-bold text-gray-900">{selectedPayment.jumlah}</p>
                <p className="text-sm text-gray-500">Periode: {selectedPayment.periode}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Instruksi:</strong> Buka aplikasi e-wallet Anda (GoPay, OVO, DANA, dll), pilih QRIS, lalu scan kode di atas.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toast.success('Pembayaran sedang diproses...');
                    setShowQrisModal(false);
                  }}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-navy-900 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Konfirmasi Pembayaran
                </button>
                <button
                  onClick={() => {
                    if (pollingInterval) {
                      clearInterval(pollingInterval);
                      setPollingInterval(null);
                    }
                    setShowQrisModal(false);
                    setQrisString('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TenantLayout>
  );
};

export default TenantPaymentsPage;
