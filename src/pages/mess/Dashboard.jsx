import { Users, ClipboardList, AlertTriangle, MessageSquare, ShoppingBag, Coffee, ChevronRight } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const MessDashboard = () => {
  const stats = [
    { label: 'Total Mess Students', value: '380', icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Breakfast Served Today', value: '312', icon: Coffee, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Lunch Served Today', value: '345', icon: Coffee, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Dinner Served Today', value: '320', icon: Coffee, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Low Stock Alerts', value: '4 Items', icon: AlertTriangle, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Pending Purchases', value: '3 Requests', icon: ShoppingBag, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Active Complaints', value: '5 Open', icon: MessageSquare, color: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Daily Cost (Est.)', value: '₹14,500', icon: ClipboardList, color: 'bg-teal-50', iconColor: 'text-teal-500' },
  ];

  const consumptionOptions = {
    chart: { type: 'column', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { title: { text: 'Students Served' } },
    series: [
      { name: 'Breakfast', data: [310, 315, 305, 320, 312, 280, 290], color: '#3B82F6' },
      { name: 'Lunch', data: [340, 335, 345, 330, 342, 300, 310], color: '#10B981' },
      { name: 'Dinner', data: [320, 325, 315, 330, 320, 290, 300], color: '#0A6C54' }
    ],
    credits: { enabled: false }
  };

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-[22px] font-bold text-gray-800 mt-2">{stat.value}</h3>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className={stat.iconColor} size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Weekly Meal Attendance Analysis</h3>
          <HCReact highcharts={Highcharts} options={consumptionOptions} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Today's Menu Overview</h3>
          <div className="space-y-3">
            {[
              { meal: 'Breakfast (07:30 AM - 09:00 AM)', items: 'Aloo Paratha, Curd, Pickle, Tea' },
              { meal: 'Lunch (12:30 PM - 02:00 PM)', items: 'Jeera Rice, Dal Fry, Roti, Paneer Butter Masala, Salad' },
              { meal: 'Snacks (05:00 PM - 06:00 PM)', items: 'Samosa, Mint Chutney, Tea' },
              { meal: 'Dinner (08:00 PM - 09:30 PM)', items: 'Veg Pulav, Tawa Roti, Mix Veg Sabzi, Custard' },
            ].map((menu, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100">
                <h4 className="font-bold text-gray-800">{menu.meal}</h4>
                <p className="text-[12px] text-gray-600 mt-1">{menu.items}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessDashboard;
