const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('layout.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Keep track if we modified something
      let modified = false;

      // 1. Remove AppSidebar import
      if (content.includes('import { AppSidebar }')) {
        content = content.replace(/import\s+{\s*AppSidebar\s*}\s+from\s+["']@\/components\/app-sidebar["'];?\n?/, '');
        modified = true;
      }

      // 2. Fix Sidebar imports
      if (content.includes('SidebarProvider') || content.includes('SidebarInset')) {
        content = content.replace(/SidebarInset,\s*/g, '');
        content = content.replace(/SidebarProvider,\s*/g, '');
        // Special case where they might be on their own line
        content = content.replace(/^\s*SidebarInset,?\s*\n/gm, '');
        content = content.replace(/^\s*SidebarProvider,?\s*\n/gm, '');
        modified = true;
      }

      // 3. Replace <SidebarProvider> wrapper
      if (content.includes('<SidebarProvider>')) {
        // Find the exact block
        const regex1 = /<\s*SidebarProvider\s*>\s*<\s*AppSidebar[^>]*>\s*<\s*SidebarInset\s*>/g;
        if (regex1.test(content)) {
            content = content.replace(regex1, '<>');
        } else {
            // Might have conditional or different spacing
            content = content.replace(/<\s*SidebarProvider\s*>/, '<>');
            content = content.replace(/<\s*AppSidebar[^>]*>/, '');
            content = content.replace(/<\s*SidebarInset\s*>/, '');
        }
        
        content = content.replace(/<\/\s*SidebarInset\s*>\s*<\/\s*SidebarProvider\s*>/g, '</>');
        content = content.replace(/<\/\s*SidebarProvider\s*>/g, '</>');
        content = content.replace(/<\/\s*SidebarInset\s*>/g, '');
        modified = true;
      }

      // 4. Remove getSession if no longer used (optional, but let's keep it if userData is used)
      // They use `const userData = { ... session.name }` so we leave getSession.

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Processed: ' + fullPath);
      }
    }
  }
}

processDir('src/app/(dashboard)');
