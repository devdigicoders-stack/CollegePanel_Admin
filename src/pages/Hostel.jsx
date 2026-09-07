import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Home, Users, LogIn, LogOut, AlertTriangle, Clock } from 'lucide-react';

const Hostel = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get('/hostel/dashboard/stats');
        setStats(res.data.stats);
        setLogs(res.data.checkInOutLogs || []);
      } catch (err) {
        console.error('Error fetching hostel stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = stats ? [
    { label: 'Total Capacity', value: stats.totalCapacity, color: 'text-primary' },
    { label: 'Occupied', value: stats.totalOccupied, color: 'text-orange-500' },
    { label: 'Available', value: stats.available, color: 'text-green-500' },
    { label: 'Active Leaves', value: stats.activeLeaves, color: 'text-blue-500' },
    { label: 'Pending Leaves', value: stats.pendingLeaves, color: 'text-yellow-500' },
    { label: "Today's Complaints", value: stats.todayComplaints, color: 'text-red-500' },
  ] : [];

  return (
    <div className="flex flex-col h-full font-['Inter']">

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-sidebar font-['Outfit']">Hostel Overview</h2>
        <p className="text-[13px] text-gray-500 mt-1">Hostel &gt; Overview</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {statCards.map((card, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center min-h-[90px]">
                  <div className="text-[11px] font-semibold text-gray-400 mb-1 tracking-wide uppercase">{card.label}</div>
                  <div className={`text-[26px] font-bold ${card.color}`}>{card.value ?? 0}</div>
                </div>
              ))}
            </div>

            {/* Occupancy Bar */}
            {stats && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-6">
                <h3 className="text-[14px] font-bold text-sidebar mb-4">Occupancy Rate</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-700"
                      style={{ width: stats.totalCapacity > 0 ? `${Math.round((stats.totalOccupied / stats.totalCapacity) * 100)}%` : '0%' }}
                    />
                  </div>
                  <span className="text-[14px] font-bold text-sidebar min-w-[48px]">
                    {stats.totalCapacity > 0 ? Math.round((stats.totalOccupied / stats.totalCapacity) * 100) : 0}%
                  </span>
                </div>
                <div className="flex gap-6 mt-3 text-[12px] text-gray-500">
                  <span><span className="font-semibold text-primary">{stats.totalOccupied}</span> occupied</span>
                  <span><span className="font-semibold text-green-500">{stats.available}</span> available</span>
                  <span><span className="font-semibold text-sidebar">{stats.totalCapacity}</span> total</span>
                </div>
              </div>
            )}

            {/* Recent Check-In/Out Logs */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <h3 className="text-[14px] font-bold text-sidebar mb-4 flex items-center gap-2">
                <Clock size={16} /> Recent Check-In / Out
              </h3>
              {logs.length === 0 ? (
                <p className="text-[13px] text-gray-400 text-center py-6">No recent check-in/out records</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.type === 'Check-In' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {log.type === 'Check-In' ? <LogIn size={14} /> : <LogOut size={14} />}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-sidebar">{log.studentId?.studentName || 'Unknown'}</p>
                          <p className="text-[11px] text-gray-400">{log.studentId?.studentId} • {log.type}</p>
                        </div>
                      </div>
                      <div className="text-[11px] text-gray-400 text-right">
                        {log.dateTime ? new Date(log.dateTime).toLocaleString() : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Hostel;

