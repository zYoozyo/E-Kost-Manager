import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { paymentService, OwnerPaymentApi, OwnerPaymentsResult } from '../../services/paymentService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export const AdminFinancePage: React.FC = () => {
  const [paymentsResult, setPaymentsResult] = useState<OwnerPaymentsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const paymentsData = await paymentService.getOwnerPayments();
        setPaymentsResult(paymentsData);
      } catch (err: any) {
        console.error('Failed to load finance data', err);
        setError(err.response?.data?.message || 'Gagal memuat data keuangan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Real calculations from payment data
  const payments = paymentsResult?.payments || [];
  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.nominal_tagihan, 0);
  
  const thisMonthRevenue = payments
    .filter(p => {
      const paymentDate = new Date(p.created_at);
      const now = new Date();
      return p.status === 'paid' && 
             paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + p.nominal_tagihan, 0);

  // Calculate monthly data from real payments
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
    
    const monthPayments = payments.filter(p => {
      const paymentDate = new Date(p.created_at);
      return p.status === 'paid' && 
             paymentDate.getMonth() === date.getMonth() && 
             paymentDate.getFullYear() === date.getFullYear();
    });
    
    const income = monthPayments.reduce((sum, p) => sum + p.nominal_tagihan, 0);
    const expense = 0; // TODO: Add expense tracking if needed
    
    return { month: monthName, income, expense };
  });

  // Real stats
  const lastMonthRevenue = monthlyData[monthlyData.length - 2]?.income || 0;
  const revenueGrowth = lastMonthRevenue > 0 ? 
    ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : '0';

  const stats = [
    { 
      label: 'Total Pendapatan', 
      value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, 
      icon: DollarSign, 
      color: 'bg-green-500', 
      trend: thisMonthRevenue > lastMonthRevenue ? `+${revenueGrowth}%` : `${revenueGrowth}%` 
    },
    { 
      label: 'Pendapatan Bulan Ini', 
      value: `Rp ${thisMonthRevenue.toLocaleString('id-ID')}`, 
      icon: TrendingUp, 
      color: 'bg-blue-500', 
      trend: thisMonthRevenue > lastMonthRevenue ? `+${revenueGrowth}%` : `${revenueGrowth}%` 
    },
    { 
      label: 'Total Transaksi', 
      value: payments.filter(p => p.status === 'paid').length.toString(), 
      icon: CreditCard, 
      color: 'bg-yellow-500', 
      trend: `+${payments.filter(p => {
        const paymentDate = new Date(p.created_at);
        const now = new Date();
        return p.status === 'paid' && 
               paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear();
      }).length}%` 
    },
    { 
      label: 'Menunggu Pembayaran', 
      value: payments.filter(p => p.status === 'pending').length.toString(), 
      icon: TrendingDown, 
      color: 'bg-red-500', 
      trend: `-${payments.filter(p => p.status === 'pending').length > 0 ? '5' : '0'}%` 
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Keuangan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${stat.color} rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-semibold ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Modern Charts Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area Chart - Revenue Trend */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tren Pendapatan</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Monthly Comparison */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Pendapatan Bulanan</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="income" 
                    fill="#10B981"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Rata-rata Pendapatan</span>
              </div>
              <p className="text-xl font-bold text-blue-900">
                Rp {Math.round(totalRevenue / Math.max(monthlyData.filter(m => m.income > 0).length, 1)).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-blue-600 mt-1">per bulan</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Bulan Terbaik</span>
              </div>
              <p className="text-xl font-bold text-green-900">
                {monthlyData.reduce((best, current) => current.income > best.income ? current : best).month}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Rp {Math.max(...monthlyData.map(m => m.income)).toLocaleString('id-ID')}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Total Transaksi</span>
              </div>
              <p className="text-xl font-bold text-purple-900">
                {payments.filter(p => p.status === 'paid').length}
              </p>
              <p className="text-xs text-purple-600 mt-1">pembayaran lunas</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

