const fs = require('fs');
const path = require('path');

function patchMembers() {
    const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'library', 'Members.jsx');
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // 1. Add imports
    if (!content.includes("import { Search, FileText, Eye, Lock, Unlock } from 'lucide-react';")) {
        content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { Search, FileText, Eye, Lock, Unlock } from 'lucide-react';");
    }
    
    // 2. Replace emojis
    content = content.replace("<span>📄</span> Export Card List", "<FileText size={15} className=\"text-gray-500\" /> Export Card List");
    content = content.replace("<span className=\"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400\">🔍</span>", "<Search className=\"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400\" size={16} />");
    content = content.replace(">👁️</button>", "><Eye size={15} /></button>");
    content = content.replace("{item.status === 'Active' ? '🔒' : '🔑'}", "{item.status === 'Active' ? <Lock size={15} /> : <Unlock size={15} />}");
    
    fs.writeFileSync(filepath, content, 'utf-8');
}

function patchBooks() {
    const filepath = path.join('d:', 'Desktop', 'DCT_CLG_CRM', 'admin', 'src', 'pages', 'library', 'Books.jsx');
    let content = fs.readFileSync(filepath, 'utf-8');
        
    // 1. Add imports
    if (!content.includes("import { X, Search, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';")) {
        content = content.replace("import { X } from 'lucide-react';", "import { X, Search, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';");
    }
        
    // 2. Replace emojis
    content = content.replace("<span>📊</span> Excel Import", "<FileSpreadsheet size={15} className=\"text-gray-500\" /> Excel Import");
    content = content.replace("<span className=\"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400\">🔍</span>", "<Search className=\"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400\" size={16} />");
    content = content.replace(">✏️</button>", "><Edit2 size={15} /></button>");
    content = content.replace(">🗑️</button>", "><Trash2 size={15} /></button>");
    
    fs.writeFileSync(filepath, content, 'utf-8');
}

patchMembers();
patchBooks();
console.log("Icons patched successfully");
