import os

def patch_members():
    filepath = r"d:\Desktop\DCT_CLG_CRM\admin\src\pages\library\Members.jsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add imports
    if "import { Search, FileText, Eye, Lock, Unlock } from 'lucide-react';" not in content:
        content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { Search, FileText, Eye, Lock, Unlock } from 'lucide-react';")
    
    # 2. Replace emojis
    content = content.replace("<span>📄</span> Export Card List", "<FileText size={15} /> Export Card List")
    content = content.replace("<span className=\"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400\">🔍</span>", "<Search className=\"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400\" size={16} />")
    content = content.replace(">👁️</button>", "><Eye size={15} /></button>")
    content = content.replace("{item.status === 'Active' ? '🔒' : '🔑'}", "{item.status === 'Active' ? <Lock size={15} /> : <Unlock size={15} />}")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
def patch_books():
    filepath = r"d:\Desktop\DCT_CLG_CRM\admin\src\pages\library\Books.jsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 1. Add imports
    if "import { X, Search, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';" not in content:
        content = content.replace("import { X } from 'lucide-react';", "import { X, Search, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';")
        
    # 2. Replace emojis
    content = content.replace("<span>📊</span> Excel Import", "<FileSpreadsheet size={15} /> Excel Import")
    content = content.replace("<span className=\"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400\">🔍</span>", "<Search className=\"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400\" size={16} />")
    content = content.replace(">✏️</button>", "><Edit2 size={15} /></button>")
    content = content.replace(">🗑️</button>", "><Trash2 size={15} /></button>")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

patch_members()
patch_books()
print("Icons patched successfully")
