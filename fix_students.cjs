const fs = require('fs');
const path = require('path');

const dir = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden');

const filesToUpdate = ['Allotment.jsx', 'Incidents.jsx', 'Visitors.jsx'];

filesToUpdate.forEach(file => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/studentsRes\.data\.students/g, 'studentsRes.data.data');
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
});
