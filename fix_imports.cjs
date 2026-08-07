const fs = require('fs');
const path = require('path');

const dir = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden');

const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/import axiosInstance from '\.\.\/\.\.\/\.\.\/utils\/axiosInstance';/g, "import axiosInstance from '../../utils/axiosInstance';");
    content = content.replace(/import axiosInstance from "\.\.\/\.\.\/\.\.\/utils\/axiosInstance";/g, 'import axiosInstance from "../../utils/axiosInstance";');
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});
console.log('Fixed imports in hostel-warden pages.');
