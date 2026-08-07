import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, ShieldAlert, FileText, CheckCircle, Car, Clock, ShieldCheck } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const SecurityDashboard = () => {
  if (!checkPermission('View Security Dashboard')) {
    return <AccessDenied />;
  }
  const [logStats, setLogStats] = useState({
    visitorsInside: 0,
    totalVisitors: 0,
    vehiclesChecked: 0,
    pendingOuting: 0,
    studentsInside: 0,
    studentsOutside: 0
  });
  
  const [incidents, setIncidents] = useState([]);
  const [sosActive, setSosActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/security/dashboard/stats');
      const data = res.data;
      
      setLogStats({
        visitorsInside: data.visitorsInside || 0,
        totalVisitors: data.totalVisitors || 0,
        vehiclesChecked: data.vehiclesChecked || 0,
        pendingOuting: data.pendingOuting || 0,
        studentsInside: data.studentsInsideCount || 0,
        studentsOutside: data.studentsOutsideCount || 0
      });
      
      setIncidents(data.incidents || []);
      setSosActive(data.sosActive || false);
      
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Students Inside Campus', value: `${logStats.studentsInside}`, icon: ShieldCheck, color: 'border-b-[#0A6C54]', iconBg: 'bg-[#0A6C54]/10', iconColor: 'text-[#0A6C54]', badge: 'Live', badgeBg: 'bg-[#0A6C54]/10 text-[#0A6C54] border-[#0A6C54]/20' },
    { label: 'Students Outside', value: `${logStats.studentsOutside}`, icon: Users, color: 'border-b-orange-400', iconBg: 'bg-orange-50', iconColor: 'text-orange-500', badge: 'Live', badgeBg: 'bg-orange-50 text-orange-600 border-orange-100' },
    { label: 'Visitors Inside Campus', value: `${logStats.visitorsInside}`, icon: Clock, color: 'border-b-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-600', badge: 'Active', badgeBg: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Total Visitors Today', value: `${logStats.totalVisitors}`, icon: FileText, color: 'border-b-indigo-500', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500', badge: 'Today', badgeBg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Pending Gatepasses', value: `${logStats.pendingOuting}`, icon: AlertTriangle, color: 'border-b-yellow-500', iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600', badge: 'Queue', badgeBg: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { label: 'Vehicles Checked-In', value: `${logStats.vehiclesChecked}`, icon: Car, color: 'border-b-purple-500', iconBg: 'bg-purple-50', iconColor: 'text-purple-600', badge: 'Today', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-500 font-medium">Initializing Security Protocols...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter'] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="text-[#0A6C54]" size={20} />
            Command Center Dashboard
          </h2>
          <p className="text-[12px] text-gray-500 mt-1 font-medium">Real-time overview of campus security, movements, and active emergency alerts</p>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-gray-50/30">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`bg-white border-b-4 ${stat.color} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center ${stat.iconColor}`}>
                    <Icon size={24} />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${stat.badgeBg}`}>
                    {stat.badge}
                  </span>
                </div>
                <h4 className="text-[28px] font-black text-gray-800">{stat.value}</h4>
                <span className="text-[13px] text-gray-500 font-medium">{stat.label}</span>
              </div>
            );
          })}
        </div>

        {/* SOS and Incidents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
            {/* Background pattern */}
            <div className={`absolute -right-10 -bottom-10 opacity-[0.03] transition-transform duration-500 group-hover:scale-110 ${sosActive ? 'text-red-500' : 'text-green-500'}`}>
              <ShieldAlert size={250} />
            </div>

            <div className="relative z-10">
              <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider flex items-center gap-2 mb-6">
                <ShieldAlert className={sosActive ? "text-red-500" : "text-green-500"} size={18} /> 
                Active Emergency Status
              </h3>
              
              {sosActive ? (
                <div className="p-6 bg-red-50/50 border-2 border-red-200 rounded-xl flex items-start gap-4 shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)] animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-inner text-red-600">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-red-800 text-[18px]">CRITICAL SOS ACTIVE</h4>
                    <p className="text-[13px] text-red-700 mt-2 font-medium leading-relaxed">High priority security incident logged within the last hour. Security personnel dispatched. Immediate administrative attention is required.</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-green-50/50 border-2 border-green-200 rounded-xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1 text-green-600">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-green-800 text-[18px]">System Secure</h4>
                    <p className="text-[13px] text-green-700 mt-2 font-medium leading-relaxed">All campus sectors are operating normally. No high-priority emergency incidents have been detected in the recent logs.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Recent Misconduct Logs</h3>
              <span className="text-[11px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded">LATEST 5</span>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {incidents.length > 0 ? incidents.map((inc, idx) => (
                <div key={idx} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex justify-between items-start hover:bg-gray-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-800 text-[13px]">{inc.type || 'Incident'}</h4>
                    <p className="text-[12px] text-gray-500 mt-1 line-clamp-1">{inc.description}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ml-4 ${
                    inc.priority === 'High' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-orange-100 text-orange-700 border border-orange-200'
                  }`}>
                    {inc.priority} PRIORITY
                  </span>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                  <ShieldCheck size={40} className="mb-3 text-green-200" />
                  <p className="text-[13px] font-medium text-gray-500">No recent incidents logged.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
