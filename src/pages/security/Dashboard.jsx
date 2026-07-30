import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, ShieldAlert, FileText, CheckCircle, Car } from 'lucide-react';
import axios from 'axios';

const SecurityDashboard = () => {
  const [logStats, setLogStats] = useState({
    visitorsInside: 0,
    totalVisitors: 0,
    vehiclesChecked: 0,
    pendingOuting: 0
  });
  
  const [incidents, setIncidents] = useState([]);
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const logsRes = await axios.get(`${import.meta.env.VITE_API_URL}/security/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const logs = logsRes.data;
      
      const visitorsInside = logs.filter(l => l.logType === 'Visitor' && !l.exitTime).length;
      const totalVisitors = logs.filter(l => l.logType === 'Visitor').length;
      const vehicles = logs.filter(l => l.logType === 'Vehicle').length;
      
      const incidentLogs = logs.filter(l => l.logType === 'Incident');
      
      setLogStats({
        visitorsInside,
        totalVisitors,
        vehiclesChecked: vehicles,
        pendingOuting: 0 // Would fetch from gatepass/hostel endpoint
      });
      
      setIncidents(incidentLogs);
      
      // Assume SOS is active if any critical incident occurred in the last hour
      const recentCritical = incidentLogs.some(l => 
        new Date() - new Date(l.entryTime) < 3600000 && l.remarks?.toLowerCase().includes('critical')
      );
      setSosActive(recentCritical);
      
    } catch (error) {
      console.error('Error fetching security data:', error);
    }
  };

  const stats = [
    { label: 'Students Inside Campus', value: '1,240', icon: Users, color: 'bg-green-50', iconColor: 'text-green-500' },
    { label: 'Students Outside', value: '180', icon: Users, color: 'bg-gray-50', iconColor: 'text-gray-500' },
    { label: 'Visitors Inside Campus', value: `${logStats.visitorsInside}`, icon: Users, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Total Visitors Today', value: `${logStats.totalVisitors} Passes`, icon: FileText, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Pending Outing Verification', value: `${logStats.pendingOuting}`, icon: AlertTriangle, color: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { label: 'Vehicles Checked-In Today', value: `${logStats.vehiclesChecked}`, icon: Car, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
  ];

  return (
    <div className="space-y-6 font-['Inter']">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-[20px] font-bold text-gray-800 mt-2">{stat.value}</h3>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className={stat.iconColor} size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className={sosActive ? "text-red-500" : "text-green-500"} size={18} /> 
            Active Emergency SOS Notifications
          </h3>
          {sosActive ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <ShieldAlert className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-red-800 text-[14px]">Critical Incident Detected</h4>
                <p className="text-[12px] text-red-700 mt-1">Status: Active Emergency. Security personnel dispatched.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-green-800 text-[14px]">All Clear</h4>
                <p className="text-[12px] text-green-700 mt-1">Status: Operational. No emergencies detected.</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-[14px] font-bold text-gray-800 font-semibold uppercase tracking-wider">Recent Incidents Logged</h3>
          <div className="space-y-3">
            {incidents.length > 0 ? incidents.map((inc, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{inc.purpose || 'Incident'}</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">{inc.remarks}</p>
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  inc.remarks?.toLowerCase().includes('critical') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>Logged</span>
              </div>
            )) : (
              <div className="p-3 bg-gray-50 rounded-lg text-[13px] border border-gray-100 text-gray-500">
                No recent incidents logged.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
