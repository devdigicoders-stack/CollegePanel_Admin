import React from 'react';
import { Book, Users, Clock, AlertTriangle, CheckCircle, RotateCcw, Bookmark, BarChart3 } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HCReact = HighchartsReact.default || HighchartsReact;

const LibraryDashboard = () => {
  const stats = [
    { label: 'Total Books', value: '12,450', icon: Book, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Total Copies', value: '24,800', icon: Book, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Available Books', value: '18,230', icon: CheckCircle, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Issued Books', value: '5,120', icon: Clock, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Overdue Books', value: '340', icon: AlertTriangle, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Reserved Books', value: '180', icon: Bookmark, color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { label: 'Lost Books', value: '45', icon: AlertTriangle, color: 'bg-gray-50', iconColor: 'text-gray-500' },
    { label: 'Damaged Books', value: '85', icon: AlertTriangle, color: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Today Issues', value: '82', icon: Clock, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    { label: 'Today Returns', value: '64', icon: RotateCcw, color: 'bg-teal-50', iconColor: 'text-teal-500' },
    { label: 'Pending Fines', value: '₹18,540', icon: BarChart3, color: 'bg-pink-50', iconColor: 'text-pink-500' },
    { label: 'Active Members', value: '2,890', icon: Users, color: 'bg-cyan-50', iconColor: 'text-cyan-500' },
  ];

  const circulationOptions = {
    chart: { type: 'area', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yAxis: { title: { text: '' } },
    series: [
      { name: 'Books Issued', data: [450, 520, 610, 580, 710, 800], color: '#0A6C54', fillOpacity: 0.1 },
      { name: 'Books Returned', data: [380, 480, 550, 520, 680, 740], color: '#3B82F6', fillOpacity: 0.1 }
    ],
    credits: { enabled: false }
  };

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{stat.label}</span>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className={stat.iconColor} size={16} />
                  </div>
                </div>
                <h3 className="text-[20px] font-bold text-gray-800 mt-2">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Library Book Circulation Chart</h3>
          <HCReact highcharts={Highcharts} options={circulationOptions} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Low Stock Books</h3>
          <div className="space-y-3">
            {[
              { title: 'Intro to Algorithms', author: 'Cormen', stock: '1 copy left' },
              { title: 'Engineering Physics', author: 'Gaur & Gupta', stock: '0 copies left' },
              { title: 'Database System Concepts', author: 'Silberschatz', stock: '2 copies left' },
              { title: 'Compiler Design', author: 'Aho & Ullman', stock: '1 copy left' },
            ].map((book, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-[13px] font-bold text-gray-800">{book.title}</h4>
                  <p className="text-[11px] text-gray-500">{book.author}</p>
                </div>
                <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">{book.stock}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Overdue Members</h3>
          <div className="space-y-3">
            {[
              { name: 'Amit Sharma (Student)', book: 'Discrete Mathematics', days: '12 days overdue' },
              { name: 'Pooja Patel (Student)', book: 'Advanced Calculus', days: '8 days overdue' },
              { name: 'Dr. S.K. Bose (Faculty)', book: 'IEEE Quantum Journal', days: '5 days overdue' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-red-50/30 rounded-lg border border-red-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-800">{item.name}</h4>
                    <p className="text-[11px] text-gray-600">{item.book}</p>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{item.days}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Pending Reservations</h3>
          <div className="space-y-3">
            {[
              { book: 'Core Java Volume I', member: 'Kunal Sen', date: 'Pickup by: 17-Feb' },
              { book: 'Fluid Mechanics', member: 'Rohan Joshi', date: 'Waiting (Pos #1)' },
              { book: 'Industrial Management', member: 'Neha Dave', date: 'Waiting (Pos #2)' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-800">{item.book}</h4>
                    <p className="text-[11px] text-gray-500">Reserved for: {item.member}</p>
                  </div>
                  <span className="text-[11px] text-[#0A6C54] font-medium">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Recent Transactions</h3>
          <div className="space-y-3">
            {[
              { type: 'Issue', book: 'Programming in ANSI C', member: 'Nikhil Mehta', time: '10 mins ago' },
              { type: 'Return', book: 'HTML & CSS Design', member: 'Anjali Shah', time: '25 mins ago' },
              { type: 'Issue', book: 'Engineering Drawing', member: 'Jayesh Soni', time: '1 hour ago' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-[13px] font-bold text-gray-800">{item.book}</h4>
                  <p className="text-[11px] text-gray-500">{item.member}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.type === 'Issue' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-green-50 text-green-600 border border-green-100'
                  }`}>{item.type}</span>
                  <p className="text-[10px] text-gray-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryDashboard;
