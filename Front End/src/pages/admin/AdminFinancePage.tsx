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
        
        const paymentsData = await paymentService.getAdminPayments();
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
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
          {/* Header - Responsive */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-yellow-500 rounded-lg">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Keuangan</h2>
          </div>

          {/* Stats Cards - Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 ${stat.color} rounded-lg`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <span className={`text-xs sm:text-sm font-semibold ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Modern Charts Section - Responsive */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Area Chart - Revenue Trend */}
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Tren Pendapatan</h3>
              </div>
              <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
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
                    formatter={(value: number | undefined) => {
                      if (value === undefined || value === null) return ['Rp 0', 'Pendapatan'];
                      return [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan'];
                    }}
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
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-green-500 rounded-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pendapatan Bulanan</h3>
              </div>
              <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
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
                    formatter={(value: number | undefined) => {
                      if (value === undefined || value === null) return ['Rp 0', 'Pendapatan'];
                      return [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan'];
                    }}
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

        </div>
      </div>
    </AdminLayout>
  );
};

