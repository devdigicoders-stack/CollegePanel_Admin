import React from 'react';

const Library = () => {
  return (
    <div className="flex flex-col h-full font-['Inter']">
      
      {/* Title area (since it's inside the page content in the screenshot) */}
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">Library Dashboard</h2>
        <p className="text-[13px] text-gray-500 mt-1">Library &gt; Dashboard</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
        
        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Total Books</div>
            <div className="text-[24px] font-bold text-[#022A36]">5,860</div>
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Issued Books</div>
            <div className="text-[24px] font-bold text-[#022A36]">236</div>
          </div>
          {/* Card 3 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Available Books</div>
            <div className="text-[24px] font-bold text-[#022A36]">5,624</div>
          </div>
          {/* Card 4 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Overdue Books</div>
            <div className="text-[24px] font-bold text-red-500">18</div>
          </div>
        </div>

        {/* Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Books Issued This Week Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col h-full min-h-[300px]">
            <h3 className="text-[14px] font-bold text-[#022A36] mb-6">Books Issued This Week</h3>
            
            <div className="flex-1 flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-gray-500 font-medium">1.</span>
                <span className="text-[13px] text-gray-700 font-medium">Engineering Mechanics by R.K. Bansal</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-gray-500 font-medium">2.</span>
                <span className="text-[13px] text-gray-700 font-medium">Strength of Materials by S.S. Rattan</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-gray-500 font-medium">3.</span>
                <span className="text-[13px] text-gray-700 font-medium">Basic Electrical Engineering by D.P. Kothari</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-gray-500 font-medium">4.</span>
                <span className="text-[13px] text-gray-700 font-medium">Computer Fundamentals by P.K. Sinha</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="text-[13px] font-semibold text-[#0A6C54] hover:text-[#085a46] transition-colors">
                View All
              </button>
            </div>
          </div>

          {/* Overdue Books Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col h-full min-h-[300px]">
            <h3 className="text-[14px] font-bold text-[#022A36] mb-6">Overdue Books</h3>
            
            <div className="flex-1 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-[13px] text-gray-500 font-medium">1.</span>
                  <span className="text-[13px] text-gray-700 font-medium">Aarav Singh (CE/23/1001)</span>
                </div>
                <span className="text-[13px] font-semibold text-red-500">5 Days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-[13px] text-gray-500 font-medium">2.</span>
                  <span className="text-[13px] text-gray-700 font-medium">Rohit Sharma (ME/23/1001)</span>
                </div>
                <span className="text-[13px] font-semibold text-red-500">3 Days</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-[13px] text-gray-500 font-medium">3.</span>
                  <span className="text-[13px] text-gray-700 font-medium">Neha Verma (CSE/23/1001)</span>
                </div>
                <span className="text-[13px] font-semibold text-red-500">2 Days</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="text-[13px] font-semibold text-[#0A6C54] hover:text-[#085a46] transition-colors">
                View All
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Library;
