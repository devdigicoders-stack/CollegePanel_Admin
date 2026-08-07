const fs = require('fs');

let content = fs.readFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/Meetings.jsx', 'utf-8');

// 1. Initial State
content = content.replace(
    /attendees:\s*\[\]\r?\n\s*\}\);/,
    "attendees: [],\n    organizer: ''\n  });"
);

// 2. handleAddMeeting
content = content.replace(
    /attendees:\s*\[\]\r?\n\s*\}\);\r?\n\s*setShowAddModal\(true\);/,
    "attendees: [],\n      organizer: ''\n    });\n    setShowAddModal(true);"
);

// 3. Edit button
content = content.replace(
    /attendees:\s*meeting\.attendees\s*\}\);\s*setIsEditing\(true\);/,
    "attendees: meeting.attendees, organizer: meeting.organizer || '' }); setIsEditing(true);"
);

// 4. payload inside handleSaveMeeting
content = content.replace(
    /const payload = \{\r?\n\s*\.\.\.formData,\r?\n\s*attendees:\s*parseInt\(formData\.attendees\)\s*\|\|\s*0\r?\n\s*\};/,
    "const payload = {\n        ...formData,\n        meetingId: isEditing ? selectedMeeting.meetingId : `MTG-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,\n        attendees: parseInt(formData.attendees) || 0\n      };"
);

// 5. handleSaveMeeting reset
content = content.replace(
    /attendees:\s*\[\]\r?\n\s*\}\);\r?\n\s*fetchMeetings\(\);/,
    "attendees: [],\n        organizer: ''\n      });\n      fetchMeetings();"
);

// 6. Form input for organizer
const form_html_old = /<label className="block text-\[13px\] font-semibold text-gray-700 mb-2">Location \*<\/label>/;
const form_html_new = `<label className="block text-[13px] font-semibold text-gray-700 mb-2">Organizer *</label>
                  <input 
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                    placeholder="E.g., Dr. Smith"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0A6C54] mb-4"
                  />
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Location *</label>`;
content = content.replace(form_html_old, form_html_new);

// 7. Validation check
content = content.replace(
    /if \(\!formData\.title \|\| \!formData\.date \|\| \!formData\.time\) \{/,
    "if (!formData.title || !formData.date || !formData.time || !formData.organizer) {"
);

fs.writeFileSync('d:/Desktop/DCT_CLG_CRM/admin/src/pages/Meetings.jsx', content, 'utf-8');
console.log("Patched Meetings.jsx with organizer");
