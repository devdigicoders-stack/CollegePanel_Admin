const fs = require('fs');
const path = require('path');

const dir = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'hostel-warden');

const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replacements
    content = content.replace(/\.name/g, '.studentName');
    content = content.replace(/\.rollNumber/g, '.studentId');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Processed ${file}`);
  }
});
