
const Hostel = () => {
  return (
    <div className="flex flex-col h-full font-['Inter']">
      
      {/* Title area */}
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-[#022A36] font-['Outfit']">Hostel Overview</h2>
        <p className="text-[13px] text-gray-500 mt-1">Hostel &gt; Overview</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
        
        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Total Rooms</div>
            <div className="text-[24px] font-bold text-[#0A6C54]">120</div>
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Occupied Rooms</div>
            <div className="text-[24px] font-bold text-orange-500">98</div>
          </div>
          {/* Card 3 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Vacant Rooms</div>
            <div className="text-[24px] font-bold text-[#022A36]">22</div>
          </div>
          {/* Card 4 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-[100px]">
            <div className="text-[12px] font-semibold text-gray-500 mb-1 tracking-wide">Total Students</div>
            <div className="text-[24px] font-bold text-[#022A36]">156</div>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Hostel Wise Students (Chart Placeholder) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col h-[280px]">
            <h3 className="text-[14px] font-bold text-[#022A36] mb-8">Hostel Wise Students</h3>
            
            <div className="flex-1 flex items-center justify-center gap-12">
              {/* Custom SVG Donut Chart */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <path
                    className="text-gray-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="4"
                  />
                  {/* Boys Hostel (63%) */}
                  <path
                    className="text-[#0A6C54]"
                    strokeDasharray="63, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="4"
                  />
                  {/* Girls Hostel (37%) */}
                  <path
                    className="text-[#2F8B73]"
                    strokeDasharray="37, 100"
                    strokeDashoffset="-63"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="4"
                  />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[22px] font-bold text-[#022A36]">156</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#0A6C54]"></div>
                  <span className="text-[13px] font-medium text-gray-500 w-24">Boys Hostel</span>
                  <span className="text-[14px] font-bold text-[#022A36]">98</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#2F8B73]"></div>
                  <span className="text-[13px] font-medium text-gray-500 w-24">Girls Hostel</span>
                  <span className="text-[14px] font-bold text-[#022A36]">58</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hostel Fee Collection */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col h-[280px]">
            <h3 className="text-[14px] font-bold text-[#022A36] mb-8">Hostel Fee Collection</h3>
            
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full flex items-center">
                {/* Collected */}
                <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-100">
                  <div className="text-[13px] font-semibold text-gray-500 mb-2">Collected</div>
                  <div className="text-[26px] font-bold text-[#022A36]">₹18,60,000</div>
                </div>
                
                {/* Pending */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-[13px] font-semibold text-gray-500 mb-2">Pending</div>
                  <div className="text-[26px] font-bold text-[#022A36]">₹6,40,000</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Button */}
        <div className="flex items-center justify-center mt-2">
          <button className="px-8 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors">
            View Details
          </button>
        </div>

      </div>

    </div>
  );
};

export default Hostel;
