import React from 'react';
import { Download, FileText, Video, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StudyMaterials = () => {
  const materials = [
    { id: 1, type: 'PDF Note', title: 'Unit 2: IP Addressing and Subnetting Guide', subject: 'Advanced Computer Networks', size: '2.4 MB' },
    { id: 2, type: 'Practical Manual', title: 'Lab Sheet 4: Web Socket Connections in React', subject: 'Web Technology Lab', size: '1.8 MB' },
    { id: 3, type: 'Previous Paper', title: 'End-Sem Theory Question Paper (Dec 2023)', subject: 'Software Engineering Concepts', size: '980 KB' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-[16px] font-bold text-gray-800">My Study Materials Library</h2>
        <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Download faculty-curated notes, lecture slides, previous year test papers, and lab manual books</p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto max-w-3xl">
        {materials.map(item => (
          <div key={item.id} className="p-4 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-50/50 transition-colors shadow-sm bg-gray-50/20 text-[13px]">
            <div className="flex items-center gap-3">
              <div className="bg-[#0A6C54]/10 p-2.5 rounded-lg text-[#0A6C54]">
                {item.type.includes('Video') ? <Video size={18} /> : <FileText size={18} />}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-400">{item.subject}</span>
                <h4 className="font-bold text-gray-800 mt-0.5">{item.title}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Type: {item.type} | Size: {item.size}</p>
              </div>
            </div>

            <button 
              onClick={() => toast.success('File download initiated successfully!')} 
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              title="Download File"
            >
              <Download size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyMaterials;
