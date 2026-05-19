const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const replacements = [
    { regex: /bg-white(?!\/| dark:)/g, replace: 'bg-white dark:bg-gray-800' },
    { regex: /bg-gray-50(?!\/| dark:)/g, replace: 'bg-gray-50 dark:bg-gray-900/50' },
    { regex: /bg-gray-100(?!\/| dark:)/g, replace: 'bg-gray-100 dark:bg-gray-700' },
    { regex: /text-gray-700(?!\/| dark:)/g, replace: 'text-gray-700 dark:text-gray-200' },
    { regex: /text-gray-600(?!\/| dark:)/g, replace: 'text-gray-600 dark:text-gray-300' },
    { regex: /text-gray-800(?!\/| dark:)/g, replace: 'text-gray-800 dark:text-gray-100' },
    { regex: /text-gray-900(?!\/| dark:)/g, replace: 'text-gray-900 dark:text-white' },
    { regex: /border-gray-100(?!\/| dark:)/g, replace: 'border-gray-100 dark:border-gray-700' },
    { regex: /border-gray-200(?!\/| dark:)/g, replace: 'border-gray-200 dark:border-gray-600' },
    { regex: /border-gray-300(?!\/| dark:)/g, replace: 'border-gray-300 dark:border-gray-600' },
    { regex: /text-\\[#1A2B34\\](?!\/| dark:)/g, replace: 'text-[#1A2B34] dark:text-white' },
    { regex: /bg-\\[#1A2B34\\](?!\/| dark:)/g, replace: 'bg-[#1A2B34] dark:bg-gray-800' },
    { regex: /(<input[^>]+className=[\"'][^\"']*)(\"[^>]*>)/g, replace: (match, p1, p2) => {
        if (!p1.includes('dark:bg-') && !p1.includes('bg-')) {
           return p1 + ' bg-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400' + p2;
        } else if (!p1.includes('dark:bg-') && p1.includes('bg-gray-50')) {
           return p1 + ' dark:text-white dark:placeholder-gray-400' + p2;
        }
        return p1 + p2;
    }},
    { regex: /(<select[^>]+className=[\"'][^\"']*)(\"[^>]*>)/g, replace: (match, p1, p2) => {
        if (!p1.includes('dark:bg-') && !p1.includes('bg-')) {
           return p1 + ' bg-transparent dark:bg-gray-700 dark:text-white' + p2;
        }
        return p1 + p2;
    }}
  ];

  let hasChanges = false;
  let newContent = content;
  
  for (const {regex, replace} of replacements) {
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, replace);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      processFile(filePath);
    }
  }
}

walkDir('components');
console.log('All components updated for dark mode!');
