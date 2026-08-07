import { useState, useEffect } from 'react';
import { ShieldAlert, Users, Bed, CheckSquare, RefreshCw, Clipboard, Zap, Landmark, UserMinus } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axiosInstance from '../../utils/axiosInstance';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';
import SkeletonLoader from '../../components/SkeletonLoader';

const HCReact = HighchartsReact.default || HighchartsReact;

const HostelWardenDashboard = () => {
  if (!checkPermission('View Hostels')) {
    return <AccessDenied />;
  }
  const [data, setData] = useState({
    totalCapacity: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    hostelStudents: 0,
    activeLeaves: 0,
    pendingLeaves: 0,
    todayComplaints: 0
  });

  const [allocations, setAllocations] = useState([]);
  const [checkInOutLogs, setCheckInOutLogs] = useState([]);
  const [blockCategories, setBlockCategories] = useState([]);
  const [blockOccupied, setBlockOccupied] = useState([]);
  const [blockAvailable, setBlockAvailable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHostelData();
  }, []);

  const fetchHostelData = async () => {
    try {
      setLoading(true);
      // Fetch rooms and allocations
      const resRooms = await axiosInstance.get('/hostel/rooms');
      // Fetch dashboard stats
      const resStats = await axiosInstance.get('/hostel/dashboard/stats');
      
      const { rooms, allocations: recentAllocations, blockData } = resRooms.data;
      const { stats, checkInOutLogs: recentLogs } = resStats.data;
      
      setData({
        totalCapacity: stats.totalCapacity,
        occupiedBeds: stats.totalOccupied,
        availableBeds: stats.available,
        hostelStudents: stats.totalOccupied,
        activeLeaves: stats.activeLeaves,
        pendingLeaves: stats.pendingLeaves,
        todayComplaints: stats.todayComplaints
      });
      
      setAllocations(recentAllocations || []);
      setCheckInOutLogs(recentLogs || []);
      
      const categories = Object.keys(blockData || {});
      const occupiedSeries = categories.map(c => blockData[c].occupied);
      const availableSeries = categories.map(c => blockData[c].available);
      
      setBlockCategories(categories);
      setBlockOccupied(occupiedSeries);
      setBlockAvailable(availableSeries);
    } catch (error) {
      console.error('Error fetching hostel dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Capacity', value: `${data.totalCapacity} Beds`, icon: Bed, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Occupied Beds', value: `${data.occupiedBeds} Beds`, icon: Bed, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Available Beds', value: `${data.availableBeds} Beds`, icon: Bed, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Hostel Students', value: `${data.hostelStudents}`, icon: Users, color: 'bg-cyan-50', iconColor: 'text-cyan-500' },
    { label: 'Students on Leave', value: `${data.activeLeaves}`, icon: UserMinus, color: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Outing/Leave Req.', value: `${data.pendingLeaves} Pending`, icon: Clipboard, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Today Complaints', value: `${data.todayComplaints} Open`, icon: ShieldAlert, color: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Recent Logs', value: `${checkInOutLogs.length}`, icon: RefreshCw, color: 'bg-purple-50', iconColor: 'text-purple-500' }
  ];

  const occupancyOptions = {
    chart: { type: 'bar', height: 260, backgroundColor: 'transparent' },
    title: { text: '' },
    xAxis: { categories: blockCategories.length ? blockCategories : ['No Blocks'] },
    yAxis: { title: { text: 'Beds' } },
    plotOptions: { series: { stacking: 'normal' } },
    series: [
      { name: 'Occupied Beds', data: blockOccupied.length ? blockOccupied : [0], color: '#0A6C54' },
      { name: 'Available Beds', data: blockAvailable.length ? blockAvailable : [0], color: '#E5E7EB' }
    ],
    credits: { enabled: false }
  };

  if (loading) {
    return <SkeletonLoader type="table" rows={5} cols={5} />;
  }

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                <h3 className="text-[18px] font-bold text-gray-800 mt-2">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Block-wise Occupancy</h3>
          <HCReact highcharts={Highcharts} options={occupancyOptions} />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Recent Check-In/Out Logs</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {checkInOutLogs.length > 0 ? checkInOutLogs.map((log, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">{log.studentId?.studentName || 'Unknown'}</div>
                  <div className="text-[11px] text-gray-500">{new Date(log.dateTime).toLocaleString()}</div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.type === 'Check-In' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {log.type}
                </span>
              </div>
            )) : (
               <div className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 text-gray-500">
                 No recent logs found.
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Recent Allocations</h3>
          <div className="space-y-3">
            {allocations.length > 0 ? allocations.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <h4 className="text-[13px] font-bold text-gray-800">{item.studentId?.studentName || 'Unknown'} ({item.studentId?.studentId || 'N/A'})</h4>
                  <p className="text-[11px] text-gray-500">{item.roomId?.blockName} - {item.roomId?.roomNumber}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>{item.status}</span>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(item.allotmentDate).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 text-gray-500">
                No recent allocations.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-[14px] font-bold text-gray-800 mb-4 font-semibold uppercase tracking-wider">Emergency Contacts</h3>
          <div className="space-y-3">
            {[
              { role: 'Campus Security Gate 1', contact: '+91 9988776655' },
              { role: 'Local Hospital / Ambulance', contact: '0265-223344' },
              { role: 'Hostel Maintenance Head', contact: '+91 8877665544' }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100">
                <span className="font-semibold text-gray-700">{item.role}</span>
                <span className="font-bold text-[#0A6C54]">{item.contact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelWardenDashboard;
