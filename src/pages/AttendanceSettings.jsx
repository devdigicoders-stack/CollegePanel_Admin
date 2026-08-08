import React, { useState, useEffect } from 'react';
import { Save, Clock, AlertCircle } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import toast from 'react-hot-toast';

function AttendanceSettings() {
  const [formData, setFormData] = useState({
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    lateThresholdMinutes: 15
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const { data } = await axiosInstance.get('/colleges/settings/attendance');
      setFormData({
        shiftStartTime: data.shiftStartTime || '09:00',
        shiftEndTime: data.shiftEndTime || '17:00',
        lateThresholdMinutes: data.lateThresholdMinutes !== undefined ? data.lateThresholdMinutes : 15
      });
    } catch (error) {
      toast.error('Failed to load attendance settings');
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.patch('/colleges/settings/attendance', formData);
      toast.success('Attendance settings updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Attendance Settings</h1>
        <p className="text-[13px] text-gray-500">Configure shift timings and half-day rules for the payroll system.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock size={18} className="text-[#5a4bda]" /> Shift Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Shift Start Time</label>
              <input 
                type="time" 
                name="shiftStartTime" 
                required 
                value={formData.shiftStartTime} 
                onChange={handleInputChange} 
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" 
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Shift End Time</label>
              <input 
                type="time" 
                name="shiftEndTime" 
                required 
                value={formData.shiftEndTime} 
                onChange={handleInputChange} 
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Late Arrival Threshold (Minutes)</label>
              <input 
                type="number" 
                name="lateThresholdMinutes" 
                required 
                min="0"
                value={formData.lateThresholdMinutes} 
                onChange={handleInputChange} 
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5a4bda] focus:border-transparent transition-all" 
              />
              <p className="text-[11px] text-gray-500 mt-2 flex items-start gap-1">
                <AlertCircle size={14} className="text-amber-500 shrink-0" />
                <span>If an employee punches in after <b>Shift Start Time + Late Arrival Threshold</b>, the system will automatically mark them as <b>Half Day</b>. This triggers a 0.5 day deduction in the Payroll.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-auto px-6 py-2.5 text-[13px] font-bold text-white bg-[#5a4bda] rounded-lg shadow-sm hover:bg-[#4d3ecc] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AttendanceSettings;
