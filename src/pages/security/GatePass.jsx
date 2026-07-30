import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const GatePass = () => {
  const [passInput, setPassInput] = useState('');
  const [scannedPass, setScannedPass] = useState(null);

  const handleScan = (e) => {
    e.preventDefault();
    if (passInput === 'GP-901') {
      setScannedPass({
        passNo: 'GP-901',
        holder: 'Rahul Sen (Student)',
        type: 'Medical Emergency Outing',
        validity: 'Valid Today',
        status: 'Approved by Warden',
        isOk: true
      });
      toast.success('Gate Pass verified successfully!');
    } else if (passInput === 'GP-EXPIRED') {
      setScannedPass({
        passNo: 'GP-EXPIRED',
        holder: 'Neha Patel (Student)',
        type: 'Temporary Outing',
        validity: 'Expired (Valid till 12:00 PM)',
        status: 'Expired',
        isOk: false
      });
      toast.error('Warning: This Gate Pass has Expired!');
    } else {
      toast.error('Invalid Gate Pass Code!');
      setScannedPass(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Gate Pass QR Code Verification</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Scan QR code or enter gate pass codes manually to verify warden exit permissions</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
        <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
          <h3 className="font-bold text-gray-800 text-[14px]">Scan / Enter Code</h3>
          <form onSubmit={handleScan} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Gate Pass Code (e.g. GP-901 or GP-EXPIRED)..." 
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] bg-white font-mono"
            />
            <button type="submit" className="bg-[#0A6C54] text-white px-4 py-2.5 rounded-lg text-[13px] font-bold">Verify</button>
          </form>
        </div>

        {scannedPass ? (
          <div className={`border p-6 rounded-xl space-y-4 ${scannedPass.isOk ? 'border-green-200 bg-green-50/20' : 'border-red-200 bg-red-50/20'}`}>
            <div className="flex items-center gap-2">
              {scannedPass.isOk ? <CheckCircle className="text-green-600" /> : <XCircle className="text-red-500" />}
              <h3 className="font-bold text-gray-800 text-[15px]">Verification Result</h3>
            </div>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-gray-500">Pass Number:</span>
                <span className="font-mono font-bold text-[#0A6C54]">{scannedPass.passNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pass Holder:</span>
                <span className="font-bold text-gray-800">{scannedPass.holder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Outing Class:</span>
                <span className="font-semibold text-gray-700">{scannedPass.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`font-bold ${scannedPass.isOk ? 'text-green-700' : 'text-red-600'}`}>{scannedPass.status}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center border border-dashed border-gray-200 rounded-xl p-6 text-gray-400 text-[13px]">
            Ready to scan. Please scan or enter a gate pass code above.
          </div>
        )}
      </div>
    </div>
  );
};

export default GatePass;
