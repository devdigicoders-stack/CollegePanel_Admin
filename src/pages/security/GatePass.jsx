import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, XCircle, ScanLine, Clock, Calendar, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import Swal from 'sweetalert2';
import { checkPermission } from '../../utils/checkPermission';
import AccessDenied from '../../components/AccessDenied';

const GatePass = () => {
  if (!checkPermission('Scan Gate Pass')) {
    return <AccessDenied />;
  }
  const [passInput, setPassInput] = useState('');
  const [scannedPass, setScannedPass] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!passInput) return toast.error('Please enter a gate pass code');
    
    setIsScanning(true);
    setScannedPass(null); // Reset previous scan
    
    try {
      const res = await axiosInstance.get(`/security/gatepass/${passInput.trim()}`);
      const data = res.data;
      
      const now = new Date();
      const validUntil = new Date(data.validUntil);
      
      let isOk = true;
      let statusStr = data.status;
      
      if (data.status !== 'Approved' && data.status !== 'Verified' && data.status !== 'Used') {
        isOk = false;
      } else if (now > validUntil) {
        isOk = false;
        statusStr = 'Expired';
      } else if (data.status === 'Approved') {
        // Automatically verify/use it if it's approved and valid
        await axiosInstance.put(`/security/gatepass/${data._id}`, { status: 'Used' });
        statusStr = 'Verified & Marked as Used';
      }

      const passDetails = {
        passNo: data._id,
        holder: `${data.studentId?.studentName || 'Unknown'} (${data.studentId?.studentId || data.studentId?.rollNumber || 'N/A'})`,
        type: data.reason || 'General Outing',
        validity: validUntil.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        status: statusStr,
        isOk,
        timestamp: new Date()
      };
      
      setScannedPass(passDetails);
      
      // Add to local history (keep last 5)
      setScanHistory(prev => [passDetails, ...prev].slice(0, 5));
      
      if (isOk) {
        toast.success('Gate Pass verified successfully!', { icon: '✅' });
        // Optionally clear input after successful scan
        setTimeout(() => setPassInput(''), 1500);
      } else {
        toast.error(`Warning: Gate Pass is ${statusStr}`, { icon: '❌' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid Gate Pass Code!');
      setScannedPass(null);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
        <div>
          <h2 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
            <ScanLine className="text-primary" size={20} />
            Gate Pass Verification
          </h2>
          <p className="text-[12px] text-gray-500 mt-1 font-medium">Scan QR code or enter gate pass codes manually to verify exit permissions</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-y-auto">
        
        {/* Left Column - Scanner */}
        <div className="flex flex-col space-y-6">
          <div className="border border-gray-200 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-800 text-[14px] mb-4 flex items-center gap-2">
              <Search size={16} className="text-gray-400" />
              Scan or Enter Code
            </h3>
            <form onSubmit={handleScan} className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Scan Barcode or Enter GP Code..." 
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                autoFocus
                className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary bg-gray-50 font-mono tracking-wider transition-all"
              />
              <button 
                type="submit" 
                disabled={isScanning}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-70 text-white px-4 py-3.5 rounded-xl text-[14px] font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {isScanning ? 'Verifying...' : 'Verify Pass'}
              </button>
            </form>
          </div>

          {/* Recent Scans History */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden flex-1">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-[13px]">Recent Scans</h3>
              <span className="text-[11px] font-semibold text-gray-400">Local History (Session)</span>
            </div>
            <div className="p-0">
              {scanHistory.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {scanHistory.map((history, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-2 h-2 rounded-full ${history.isOk ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="text-[12px] font-bold text-gray-800">{history.holder}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{history.passNo}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400">{history.timestamp.toLocaleTimeString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center text-gray-400">
                  <Clock size={32} className="mb-2 text-gray-200" />
                  <p className="text-[12px] font-medium">No recent scans</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="flex flex-col">
          {scannedPass ? (
            <div className={`flex-1 border-2 rounded-2xl p-8 relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-4 ${
              scannedPass.isOk ? 'border-green-400 bg-green-50/30 shadow-[0_0_40px_-10px_rgba(74,222,128,0.3)]' : 'border-red-400 bg-red-50/30 shadow-[0_0_40px_-10px_rgba(248,113,113,0.3)]'
            }`}>
              
              {/* Background Icon */}
              <div className="absolute -right-8 -bottom-8 opacity-[0.03] pointer-events-none">
                {scannedPass.isOk ? <CheckCircle size={250} /> : <XCircle size={250} />}
              </div>

              <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                  scannedPass.isOk ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-red-500 text-white shadow-red-500/30'
                }`}>
                  {scannedPass.isOk ? <CheckSquare size={40} /> : <ShieldAlert size={40} />}
                </div>
                <div>
                  <h3 className={`font-black text-[24px] ${scannedPass.isOk ? 'text-green-700' : 'text-red-700'}`}>
                    {scannedPass.isOk ? 'PASS VALID' : 'PASS REJECTED'}
                  </h3>
                  <p className="text-[13px] font-bold text-gray-600 mt-1 uppercase tracking-wider">{scannedPass.status}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm relative z-10">
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Pass Number</span>
                  <span className="font-mono text-[16px] font-bold text-primary">{scannedPass.passNo}</span>
                </div>
                
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Student Details</span>
                  <span className="font-bold text-[16px] text-gray-800">{scannedPass.holder}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Outing Reason</span>
                    <span className="font-semibold text-[13px] text-gray-700">{scannedPass.type}</span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Valid Until</span>
                    <span className="font-semibold text-[13px] text-gray-700 flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      {scannedPass.validity}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center bg-gray-50/50">
              <ScanLine size={64} className="text-gray-300 mb-6" />
              <h3 className="text-[16px] font-bold text-gray-700">Ready to Scan</h3>
              <p className="text-[13px] text-gray-500 mt-2 max-w-[250px] leading-relaxed">
                Connect a barcode scanner and scan a gate pass, or manually type the code in the field on the left.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GatePass;
