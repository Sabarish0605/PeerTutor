const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
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

  // 1. Replace bg-gray-50 -> bg-white
  if (content.match(/\bbg-gray-50\b/g)) {
    content = content.replace(/\bbg-gray-50\b/g, 'bg-white');
    changed = true;
  }

  // 2. Replace bg-white -> bg-[#F8F9FA] 
  // ensure it is followed by space, quote, or backtick so we don't catch bg-white/90
  const bgWhiteRegex = /bg-white(?=[\s\"\'\`])/g;
  if (content.match(bgWhiteRegex)) {
    content = content.replace(bgWhiteRegex, 'bg-[#F8F9FA]');
    changed = true;
  }

  // 3. Replace bg-[#F4F7FE] -> bg-gray-200
  if (content.includes('bg-[#F4F7FE]')) {
    content = content.replace(/bg-\[#F4F7FE\]/g, 'bg-gray-200');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
