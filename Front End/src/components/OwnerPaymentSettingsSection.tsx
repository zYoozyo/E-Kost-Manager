import React, { useEffect, useState } from 'react';
import { ownerPaymentSettingsService, OwnerPaymentSettings } from '../services/ownerPaymentSettingsService';
import toast from 'react-hot-toast';
import { CreditCard, Edit3, Save, X, Check, AlertCircle } from 'lucide-react';

export const OwnerPaymentSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<OwnerPaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    bank_name: '',
    bank_account_number: '',
    bank_account_holder: '',
    qris_payload: '',
  });

  const BANK_OPTIONS = [
    { id: 'BCA', label: 'BCA' },
    { id: 'BRI', label: 'BRI' },
    { id: 'BNI', label: 'BNI' },
    { id: 'MANDIRI', label: 'Mandiri' },
    { id: 'CIMB', label: 'CIMB Niaga' },
    { id: 'BSI', label: 'BSI' },
  ];

  const BANK_ICONS: Record<string, string> = {
    BCA: '/img/bca.png',
    BRI: '/img/bri.png',
    BNI: '/img/bni.png',
    MANDIRI: '/img/mandiri.png',
    CIMB: '/img/cimb.png',
    BSI: '/img/bsi.png',
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await ownerPaymentSettingsService.get();
        setSettings(data);
        if (data) {
          setForm({
            bank_name: data.bank_name ?? '',
            bank_account_number: data.bank_account_number ?? '',
            bank_account_holder: data.bank_account_holder ?? '',
            qris_payload: data.qris_payload ?? '',
          });
        }
      } catch (error: any) {
        console.error('Failed to load owner payment settings', error);
        toast.error(error?.response?.data?.message || 'Gagal memuat pengaturan pembayaran');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updated = await ownerPaymentSettingsService.update(form);
      setSettings(updated);
      setIsEditing(false);
      toast.success('Pengaturan pembayaran berhasil disimpan');
    } catch (error: any) {
      console.error('Failed to save owner payment settings', error);
      toast.error(error?.response?.data?.message || 'Gagal menyimpan pengaturan pembayaran');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form ke saved data
    if (settings) {
      setForm({
        bank_name: settings.bank_name ?? '',
        bank_account_number: settings.bank_account_number ?? '',
        bank_account_holder: settings.bank_account_holder ?? '',
        qris_payload: settings.qris_payload ?? '',
      });
    }
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            Pengaturan Pembayaran Kost
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Informasi ini akan digunakan penyewa untuk melakukan pembayaran melalui transfer bank atau QRIS.
          </p>
        </div>
        {!isEditing && settings && (settings.bank_name || settings.bank_account_number || settings.bank_account_holder || settings.qris_payload) && (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500">Memuat pengaturan pembayaran...</p>
          </div>
        </div>
      ) : isEditing ? (
        // MODE EDIT
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">Pilih Bank untuk Transfer</h4>
            <p className="text-xs text-gray-500 mb-4">Pilih salah satu bank di bawah atau isi nama bank manual.</p>
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              {BANK_OPTIONS.map((bank) => {
                const isActive = form.bank_name === bank.id;
                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        bank_name: bank.id,
                      }))
                    }
                    className={`relative group flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${isActive
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <span className="inline-flex w-12 h-8 items-center justify-center overflow-hidden rounded mb-2">
                      {BANK_ICONS[bank.id] ? (
                        <img
                          src={BANK_ICONS[bank.id]}
                          alt={bank.label}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <CreditCard className="w-5 h-5 text-blue-500" />
                      )}
                    </span>
                    <span className={`text-xs font-medium ${isActive ? 'text-blue-800' : 'text-gray-700 group-hover:text-blue-700'}`}>
                      {bank.label}
                    </span>
                    {isActive && (
                      <Check className="absolute top-1 right-1 w-4 h-4 text-blue-600 bg-white rounded-full p-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              name="bank_name"
              value={form.bank_name}
              onChange={handleChange}
              placeholder="Nama bank lainnya (opsional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Rekening
              </label>
              <input
                type="text"
                name="bank_account_number"
                value={form.bank_account_number}
                onChange={handleChange}
                placeholder="Masukkan nomor rekening"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                name="bank_account_holder"
                value={form.bank_account_holder}
                onChange={handleChange}
                placeholder="Sesuai nama di rekening"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QRIS Payload / Link
            </label>
            <textarea
              name="qris_payload"
              value={form.qris_payload}
              onChange={handleChange}
              rows={3}
              placeholder="Tempel data QRIS statis dari merchant (opsional, bisa diisi nanti)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Data ini tidak ditampilkan ke publik sebagai teks mentah. Frontend akan mengubahnya menjadi QR code untuk tenant.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-60 transition-colors font-medium text-sm"
            >
              <X className="w-4 h-4" />
              Batal
            </button>
          </div>
        </div>
      ) : (
        // MODE VIEW (card)
        <div className="space-y-6">
          {settings && (settings.bank_name || settings.bank_account_number || settings.bank_account_holder || settings.qris_payload) ? (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Card Transfer Bank */}
              <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Transfer Bank
                  </h4>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</span>
                    <span className="text-sm font-bold text-gray-900">{settings.bank_name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-b border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">No. Rekening</span>
                    <span className="text-sm font-mono font-bold text-gray-900">{settings.bank_account_number || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Atas Nama</span>
                    <span className="text-sm font-bold text-gray-900">{settings.bank_account_holder || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Card QRIS */}
              <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    QRIS (Opsional)
                  </h4>
                </div>
                <div className="p-6 flex items-center justify-center min-h-[160px]">
                  {settings.qris_payload ? (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600 font-medium">QRIS tersimpan</p>
                      <p className="text-xs text-gray-400 mt-1">Akan ditampilkan ke tenant sebagai QR code</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium">QRIS belum diatur</p>
                      <p className="text-xs text-gray-400 mt-1">Tambahkan nanti jika sudah punya merchant QRIS</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Pengaturan Pembayaran</h4>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Tambahkan informasi rekening dan QRIS agar penyewa dapat melakukan pembayaran dengan mudah.
              </p>
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-md"
              >
                <Edit3 className="w-4 h-4" />
                Tambah Pengaturan Pembayaran
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
