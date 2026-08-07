const fs = require('fs');

let content = fs.readFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/Meetings.jsx', 'utf-8');

// 1. Imports
content = content.replace(
    /ChevronLeft, ChevronRight, Calendar, Users, Clock, MapPin, Check, XCircle\r?\n\} from 'lucide-react';/,
    "ChevronLeft, ChevronRight, Calendar, Users, Clock, MapPin, Check, XCircle, List, CalendarDays\n} from 'lucide-react';"
);
content = content.replace(
    "import SkeletonLoader from '../components/SkeletonLoader';",
    "import SkeletonLoader from '../components/SkeletonLoader';\nimport MeetingCalendar from '../components/MeetingCalendar';"
);

// 2. States
content = content.replace(
    "const [activeTab, setActiveTab] = useState('Upcoming');",
    "const [viewMode, setViewMode] = useState('list');\n  const [activeTab, setActiveTab] = useState('Upcoming');"
);
content = content.replace(
    "const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });",
    "const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });\n  const [formLoading, setFormLoading] = useState(false);\n  const [isEditing, setIsEditing] = useState(false);"
);

// 3. useEffect
content = content.replace(
    /useEffect\(\(\) => \{\r?\n    fetchMeetings\(\);\r?\n  \}, \[activeTab, filters\]\);/,
    "  useEffect(() => {\n    fetchMeetings();\n  }, [activeTab, filters, viewMode, pagination.page]);"
);

// 4. fetchMeetings limit
content = content.replace(
    "limit: pagination.limit,",
    "limit: viewMode === 'calendar' ? 100 : pagination.limit,"
);

// 5. handleAddMeeting
content = content.replace(
    /const handleAddMeeting = \(\) => \{\r?\n    setFormData\(\{/,
    "const handleAddMeeting = () => {\n    setIsEditing(false);\n    setFormData({"
);

// 6. Header Toggle
const header_old_regex = /\{\/\* Header \*\/\}\r?\n\s+<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-2 gap-3">\r?\n\s+<div>\r?\n\s+<h2 className="text-lg font-bold text-gray-800">Meetings<\/h2>\r?\n\s+<p className="text-\[13px\] text-gray-500 mt-1">Schedule and manage meetings<\/p>\r?\n\s+<\/div>\r?\n\s+<button \r?\n\s+onClick=\{handleAddMeeting\}\r?\n\s+className="flex items-center gap-2 bg-\[#0A6C54\] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-\[#085a46\] transition-colors"\r?\n\s+>\r?\n\s+<Plus size=\{16\} \/>\r?\n\s+Schedule Meeting\r?\n\s+<\/button>\r?\n\s+<\/div>/;

const header_new = `      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-4 pb-2 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Meetings</h2>
          <p className="text-[13px] text-gray-500 mt-1">Schedule and manage meetings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('list')}
              className={\`p-1.5 rounded-md flex items-center justify-center transition-colors \${viewMode === 'list' ? 'bg-white shadow-sm text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'}\`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={\`p-1.5 rounded-md flex items-center justify-center transition-colors \${viewMode === 'calendar' ? 'bg-white shadow-sm text-[#0A6C54]' : 'text-gray-500 hover:text-gray-700'}\`}
              title="Calendar View"
            >
              <CalendarDays size={16} />
            </button>
          </div>
          <button 
            onClick={handleAddMeeting}
            className="flex items-center gap-2 bg-[#0A6C54] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#085a46] transition-colors"
          >
            <Plus size={16} />
            Schedule Meeting
          </button>
        </div>
      </div>`;

content = content.replace(header_old_regex, header_new);

// 7. Calendar Rendering
const render_old_regex = /\{\/\* Table \*\/\}\r?\n\s+<div className="flex-1 overflow-x-auto">/;

const render_new = `{viewMode === 'calendar' ? (
        <div className="flex-1 p-6 bg-[#F9FAFB] overflow-y-auto custom-scrollbar">
          <MeetingCalendar 
            meetings={meetings} 
            onDateClick={(dateStr) => {
              handleAddMeeting();
              setFormData(prev => ({...prev, date: dateStr}));
            }}
            onMeetingClick={(meeting) => {
              setSelectedMeeting(meeting);
              setShowViewModal(true);
            }}
          />
        </div>
      ) : (
        <>
      {/* Table */}
      <div className="flex-1 overflow-x-auto">`;

content = content.replace(render_old_regex, render_new);

// Add closing tag for <> before Add Meeting Modal
const add_modal_old_regex = /\{\/\* ADD MEETING MODAL \*\/\}/;
content = content.replace(
    add_modal_old_regex,
    "      </>\n      )}\n\n      {/* ADD MEETING MODAL */}"
);

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/Meetings.jsx', content, 'utf-8');
console.log("Patched Meetings.jsx successfully!");
