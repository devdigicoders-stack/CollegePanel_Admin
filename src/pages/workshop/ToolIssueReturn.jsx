import React, { useState } from 'react';
import { Search, Plus, Calendar, Save, CheckCircle, RotateCcw, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';

const ToolIssueReturn = () => {
  const [activeTab, setActiveTab] = useState('Issue');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTool, setSelectedTool] = useState('');
  const [issuedQty, setIssuedQty] = useState(1);

  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnDetails, setReturnDetails] = useState(null);

  const handleIssue = (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedTool) return;
    toast.success(`Tool ${selectedTool} issued to ${selectedStudent} successfully!`);
    setSelectedStudent('');
    setSelectedTool('');
    setIssuedQty(1);
  };

  const handleScanReturn = (e) => {
    e.preventDefault();
    if (returnBarcode === 'TOOL-FIT-01') {
      setReturnDetails({
        toolId: 'TOOL-FIT-01',
        name: 'Flat Smooth File 12"',
        borrower: 'Amit Sharma (Student)',
        issueTime: '15-Feb 09:00 AM',
        status: 'Issued'
      });
      setReturnBarcode('');
    } else {
      toast.error('No active issue record found for this tool ID!');
    }
  };

  const handleCompleteReturn = () => {
    toast.success(`Tool ${returnDetails.name} returned to rack. Status cleared.`);
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
              setSelectedTool('');
              setReturnDetails(null);
            }}
            className={`px-6 py-4 text-[14px] font-semibold relative ${
              activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab} Tools
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-md"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'Issue' ? (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
          {/* Issue Parameters */}
          <form onSubmit={handleIssue} className="border border-gray-100 p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-[14px] pb-2 border-b border-gray-100">Tool Issue Requisition</h3>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Student / Batch</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter Student Name / Roll No..."
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Select Tool</label>
                <select 
                  value={selectedTool} 
                  onChange={(e) => setSelectedTool(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                >
                  <option value="">-- Choose Hand Tool --</option>
                  <option value="Flat Smooth File 12 (TOOL-FIT-01)">Flat Smooth File 12" (TOOL-FIT-01)</option>
                  <option value="Try Square 6 (TOOL-FIT-02)">Try Square 6" (TOOL-FIT-02)</option>
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
                  <option>Good / Working</option>
                  <option>Slightly Worn</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!selectedStudent || !selectedTool}
              className={`w-full py-3 rounded-lg text-[13px] font-bold text-white transition-colors mt-4 ${
                selectedStudent && selectedTool ? 'bg-primary hover:bg-primary-hover' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Issue Tool
            </button>
          </form>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
          {/* Scan for Return */}
          <div className="border border-gray-100 p-5 rounded-xl bg-gray-50/50 space-y-4">
            <h3 className="font-bold text-gray-800 text-[14px]">Scan Tool ID for Return</h3>
            <form onSubmit={handleScanReturn} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Scan / Type Tool ID (e.g. TOOL-FIT-01)..." 
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
                  <span className="text-gray-500">Tool:</span>
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
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Returned Tool Condition</label>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]">
                  <option>Good / Working</option>
                  <option>Damaged (Requires maintenance / repair fine)</option>
                  <option>Lost (Cost recovery applies)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea placeholder="Write remarks here..." className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px] h-24 resize-none"></textarea>
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
              Post Tool Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolIssueReturn;
