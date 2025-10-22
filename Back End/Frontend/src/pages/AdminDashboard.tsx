import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [kosts, setKosts] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    // Initialize AOS
    const initAOS = async () => {
      const AOS = (await import('aos')).default;
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
      });
    };
    initAOS();
  }, []);

  // Mock data - replace with actual API calls
  const stats = [
    { name: 'Total Kost', value: '12', icon: Building2, color: 'bg-blue-500' },
    { name: 'Total Penyewa', value: '45', icon: Users, color: 'bg-green-500' },
    { name: 'Pembayaran Bulan Ini', value: 'Rp 15.2M', icon: CreditCard, color: 'bg-yellow-500' },
    { name: 'Pengaduan Aktif', value: '3', icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const recentPayments = [
    { id: 1, tenant: 'John Doe', kost: 'Kost ABC', amount: 'Rp 1.500.000', status: 'paid', date: '2024-01-15' },
    { id: 2, tenant: 'Jane Smith', kost: 'Kost XYZ', amount: 'Rp 1.200.000', status: 'pending', date: '2024-01-14' },
    { id: 3, tenant: 'Bob Johnson', kost: 'Kost DEF', amount: 'Rp 1.800.000', status: 'overdue', date: '2024-01-10' },
  ];

  const recentComplaints = [
    { id: 1, tenant: 'John Doe', title: 'AC Tidak Dingin', status: 'pending', priority: 'high' },
    { id: 2, tenant: 'Jane Smith', title: 'WiFi Lambat', status: 'in_progress', priority: 'medium' },
    { id: 3, tenant: 'Bob Johnson', title: 'Kebocoran Air', status: 'resolved', priority: 'high' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy-900 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-accent-400 mr-3" />
              <h1 className="text-2xl font-bold">E-Kost Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-white/70">Pemilik Kost</p>
              </div>
              <button
                onClick={logout}
                className="bg-accent-500 text-navy-900 px-4 py-2 rounded-lg hover:bg-accent-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm p-6"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'kosts', name: 'Kost' },
                { id: 'tenants', name: 'Penyewa' },
                { id: 'payments', name: 'Pembayaran' },
                { id: 'complaints', name: 'Pengaduan' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Recent Payments */}
                <div data-aos="fade-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pembayaran Terbaru</h3>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Lihat Semua
                    </button>
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
                            Jumlah
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentPayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {payment.tenant}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.kost}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.date}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Complaints */}
                <div data-aos="fade-up" data-aos-delay="200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Pengaduan Terbaru</h3>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Lihat Semua
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentComplaints.map((complaint) => (
                      <div key={complaint.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                            <p className="text-sm text-gray-500">Dari: {complaint.tenant}</p>
                          </div>
                          <div className="flex space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kosts' && (
              <div data-aos="fade-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Kost</h3>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Kost
                  </button>
                </div>
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada kost yang terdaftar</p>
                  <p className="text-sm text-gray-400">Klik tombol "Tambah Kost" untuk memulai</p>
                </div>
              </div>
            )}

            {activeTab === 'tenants' && (
              <div data-aos="fade-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Penyewa</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari penyewa..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada penyewa yang terdaftar</p>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div data-aos="fade-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Riwayat Pembayaran</h3>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option>Semua Status</option>
                      <option>Paid</option>
                      <option>Pending</option>
                      <option>Overdue</option>
                    </select>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada data pembayaran</p>
                </div>
              </div>
            )}

            {activeTab === 'complaints' && (
              <div data-aos="fade-up">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Daftar Pengaduan</h3>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option>Semua Status</option>
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada pengaduan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};