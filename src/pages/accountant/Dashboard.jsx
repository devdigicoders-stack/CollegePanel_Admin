import React from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, CreditCard, Wallet, BarChart3, PieChart, Zap } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const AccountantDashboard = () => {
  const stats = [
    { label: 'Today Fee Collection', value: '₹45,000', icon: DollarSign, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Monthly Collection', value: '₹8,50,000', icon: TrendingUp, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Total Pending Dues', value: '₹2,34,000', icon: AlertCircle, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Total Expenses', value: '₹1,23,000', icon: CreditCard, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Refunds Pending', value: '₹56,000', icon: Wallet, color: 'bg-pink-50', iconColor: 'text-pink-500' },
    { label: 'Scholarship Pending', value: '₹3,45,000', icon: CheckCircle, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Cash Balance', value: '₹2,10,000', icon: Wallet, color: 'bg-cyan-50', iconColor: 'text-cyan-500' },
    { label: 'Bank Balance', value: '₹15,67,000', icon: BarChart3, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Payroll Pending', value: '₹8,90,000', icon: Clock, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Overdue Installments', value: '₹1,23,000', icon: AlertCircle, color: 'bg-rose-50', iconColor: 'text-rose-500' },
  ];

  const collectionChartOptions = {
    chart: { type: 'column', height: 280, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], gridLineWidth: 0 },
    yAxis: { title: { text: '' }, gridLineDashStyle: 'Dash' },
    series: [
      { name: 'Fee Collection', data: [650000, 720000, 850000, 920000, 1050000, 1200000], color: '#10B981' },
      { name: 'Expenses', data: [320000, 350000, 380000, 410000, 450000, 500000], color: '#EF4444' }
    ],
    legend: { enabled: true },
    credits: { enabled: false },
    tooltip: { backgroundColor: '#fff', borderRadius: 8, shadow: true }
  };

  const paymentModeChartOptions = {
    chart: { type: 'pie', height: 280, backgroundColor: 'transparent' },
    title: { text: '' },
    plotOptions: { pie: { dataLabels: { enabled: true, format: '{point.name}: {point.y}%' } } },
    series: [{
      name: 'Payment Mode',
      data: [
        { name: 'Bank Transfer', y: 45 },
        { name: 'UPI', y: 30 },
        { name: 'Cash', y: 15 },
        { name: 'Card', y: 10 }
      ]
    }],
    credits: { enabled: false }
  };

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-gray-600 font-medium mb-1">{stat.label}</p>
                  <h3 className="text-[20px] font-bold text-gray-800">{stat.value}</h3>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className={`${stat.iconColor}`} size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Monthly Income vs Expense</h3>
          <HCReact highcharts={Highcharts} options={collectionChartOptions} containerProps={{ style: { height: '280px' } }} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Payment Mode Summary</h3>
          <HCReact highcharts={Highcharts} options={paymentModeChartOptions} containerProps={{ style: { height: '280px' } }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {[
              { type: 'Fee Collection', amount: '₹15,000', date: 'Today', status: 'Completed' },
              { type: 'Expense Payment', amount: '₹5,000', date: 'Today', status: 'Completed' },
              { type: 'Refund Processed', amount: '₹8,000', date: 'Yesterday', status: 'Completed' },
              { type: 'Scholarship Paid', amount: '₹25,000', date: '2 days ago', status: 'Completed' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{item.type}</p>
                  <p className="text-[11px] text-gray-600">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-gray-800">{item.amount}</p>
                  <p className="text-[11px] text-green-600">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Pending Refunds</h3>
          <div className="space-y-3">
            {[
              { studentName: 'Aarav Singh', amount: '₹5,000', reason: 'Admission Cancellation', date: '2024-02-10' },
              { studentName: 'Neha Verma', amount: '₹3,000', reason: 'Duplicate Payment', date: '2024-02-09' },
              { studentName: 'Vikram Patel', amount: '₹8,000', reason: 'Hostel Cancellation', date: '2024-02-08' },
              { studentName: 'Muskan Jain', amount: '₹2,000', reason: 'Excess Payment', date: '2024-02-07' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-1">
                  <p className="text-[12px] font-medium text-gray-800">{item.studentName}</p>
                  <p className="text-[12px] font-bold text-orange-600">{item.amount}</p>
                </div>
                <p className="text-[11px] text-gray-600">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4">Due Fee Students</h3>
          <div className="space-y-3">
            {[
              { studentName: 'Priya Singh', course: 'Diploma in CE', dueAmount: '₹12,000', dueDate: '2024-02-05' },
              { studentName: 'Rahul Verma', course: 'Diploma in IT', dueAmount: '₹8,500', dueDate: '2024-02-08' },
              { studentName: 'Sneha Patel', course: 'Diploma in ME', dueAmount: '₹15,000', dueDate: '2024-02-10' },
              { studentName: 'Arjun Kumar', course: 'Diploma in EE', dueAmount: '₹6,000', dueDate: '2024-02-12' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-1">
                  <p className="text-[12px] font-medium text-gray-800">{item.studentName}</p>
                  <p className="text-[12px] font-bold text-red-600">{item.dueAmount}</p>
                </div>
                <p className="text-[11px] text-gray-600">{item.course} • Due: {item.dueDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
