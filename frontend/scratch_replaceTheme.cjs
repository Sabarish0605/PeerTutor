const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules')) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/sabar/peertutor/frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const regex = /\b(text|bg|border|ring|stroke|fill|from|via|to|shadow)-(blue|purple|indigo|green)-([0-9]{1,3})\b/g;
  if (regex.test(content)) {
    content = content.replace(regex, '$1-primary-$3');
    changed = true;
  }
  
  // also handle standard lucide-react replace in LandingPage
  if (file.endsWith('LandingPage.jsx')) {
    if (content.includes('GraduationCap, Clock, Banknote')) {
      content = content.replace('GraduationCap, Clock, Banknote', 'GraduationCap, Clock, Briefcase');
      changed = true;
    }
    if (content.includes('<Banknote className="w-7 h-7" />')) {
      content = content.replace('<Banknote className="w-7 h-7" />', '<Briefcase className="w-7 h-7" />');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
