import React, { useState } from 'react';
import { Search, Plus, Calendar, Save, CheckCircle, RotateCcw, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';

const IssueReturn = () => {
  const [activeTab, setActiveTab] = useState('Issue');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedEquip, setSelectedEquip] = useState('');
  const [issuedQty, setIssuedQty] = useState(1);

  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnDetails, setReturnDetails] = useState(null);

  const handleIssue = (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedEquip) return;
    toast.success(`Equipment ${selectedEquip} issued to ${selectedStudent} successfully!`);
    setSelectedStudent('');
    setSelectedEquip('');
    setIssuedQty(1);
  };

  const handleScanReturn = (e) => {
    e.preventDefault();
    if (returnBarcode === 'EQP-ECE-041') {
      setReturnDetails({
        equipId: 'EQP-ECE-041',
        name: 'Digital Oscilloscope',
        borrower: 'Amit Sharma (Student)',
        issueTime: '15-Feb 09:30 AM',
        status: 'Issued'
      });
      setReturnBarcode('');
    } else {
      toast.error('No active issue record found for this asset barcode!');
    }
  };

  const handleCompleteReturn = () => {
    toast.success(`Equipment ${returnDetails.name} returned to inventory. Status cleared.`);
    setReturnDetails(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-6 pt-2">
        {['Issue', 'Return'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedStudent('');
              setSelectedEquip('');
              setReturnDetails(null);
            }}
            className={`px-6 py-4 text-[14px] font-semibold relative ${
              activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab} Equipment
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-md"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'Issue' ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
          {/* Issue Parameters */}
          <form onSubmit={handleIssue} className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Issue Requisition</h3>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Student / Teacher</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter Name or ID (e.g. Amit Sharma)..."
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Equipment</label>
                <select 
                  value={selectedEquip} 
                  onChange={(e) => setSelectedEquip(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="">-- Choose Equipment --</option>
                  <option value="Digital Oscilloscope (EQP-ECE-041)">Digital Oscilloscope (EQP-ECE-041)</option>
                  <option value="Variable DC Power Supply (EQP-ECE-042)">Variable DC Power Supply (EQP-ECE-042)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Issue Date</label>
                  <input type="date" className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1">Quantity</label>
                  <input type="number" className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]" value={issuedQty} onChange={(e) => setIssuedQty(e.target.value)} min="1" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Initial Condition</label>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]">
                  <option>Working / Calibrated</option>
                  <option>Working / Minor Scratches</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!selectedStudent || !selectedEquip}
              className={`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors mt-4 ${
                selectedStudent && selectedEquip ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Issue Equipment Copies
            </button>
          </form>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
          {/* Scan for Return */}
          <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
            <h3 className="font-bold text-gray-800 text-[14px]">Scan Asset ID for Return</h3>
            <form onSubmit={handleScanReturn} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Scan / Type Equipment ID (e.g. EQP-ECE-041)..." 
                value={returnBarcode}
                onChange={(e) => setReturnBarcode(e.target.value)}
                className="flex-1 p-2.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-primary bg-white font-mono"
              />
              <button type="submit" className="bg-primary text-white px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-1">
                <Barcode size={15} /> Scan
              </button>
            </form>

            {returnDetails && (
              <div className="bg-white p-4 rounded-lg border border-gray-100 text-[13px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Asset:</span>
                  <span className="font-bold text-gray-800">{returnDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issued To:</span>
                  <span className="font-semibold text-gray-800">{returnDetails.borrower}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issue Date:</span>
                  <span className="text-gray-600">{returnDetails.issueTime}</span>
                </div>
              </div>
            )}
          </div>

          {/* Book Condition & Return Action */}
          <div className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Return Details</h3>
              
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Returned Copy Condition</label>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]">
                  <option>Working / Calibrated</option>
                  <option>Damaged / Requires Repair (Post fine log)</option>
                  <option>Lost (Full cost recovery applies)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea placeholder="Write any physical damages or exceptions here..." className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-24 resize-none"></textarea>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleCompleteReturn}
              disabled={!returnDetails}
              className={`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors ${
                returnDetails ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Post Asset Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueReturn;
