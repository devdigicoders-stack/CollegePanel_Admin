import React from 'react';
import { Download, FileText, BadgeCheck, FileImage } from 'lucide-react';
import toast from 'react-hot-toast';

const Downloads = () => {
  const documents = [
    { id: 1, name: 'Admit Card - Sem 4 Theory Exams', type: 'Admit Card', date: 'Available Now' },
    { id: 2, name: 'Fee Receipt - Installment 1 (Sem 4)', type: 'Fee Receipt', date: 'Paid 15-Jan' },
    { id: 3, name: 'Bonafide Certificate Request copy', type: 'Bonafide', date: 'Generated 10-Feb' },
    { id: 4, name: 'Student Identity Card (Digital Copy)', type: 'ID Card', date: 'Valid' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Downloads & Issued Certificates</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Download digital copies of your admit card, paid receipts, ID cards, and semester marksheets</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
        {documents.map(item => (
          <div key={item.id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-50/50 transition-colors shadow-sm bg-gray-50/20 text-[13px]">
            <div className="flex items-center gap-3">
              <div className="bg-[#0A6C54]/10 p-2.5 rounded-lg text-[#0A6C54]">
                {item.type === 'ID Card' ? <FileImage size={18} /> : <FileText size={18} />}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-400">{item.type}</span>
                <h4 className="font-bold text-gray-800 mt-0.5">{item.name}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Status: {item.date}</p>
              </div>
            </div>

            <button 
              onClick={() => toast.success('Document download initiated successfully!')} 
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              title="Download Document"
            >
              <Download size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Downloads;
