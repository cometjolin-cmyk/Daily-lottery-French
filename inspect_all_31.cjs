const fs = require('fs');

const ocr = JSON.parse(fs.readFileSync('oct_ocr.json', 'utf8'));
ocr.sort((a, b) => a.day - b.day);

// Let's create a detailed inspection script that shows each day's exact Chinese, English, and Tagalog extracted from OCR
for (let d = 1; d <= 31; d++) {
  const item = ocr.find(i => i.day === d);
  console.log(`\n================ DAY ${d} (${item ? item.title : 'N/A'}) ================`);
  if (!item) continue;
  
  // Find lines with high density of Chinese characters
  const lines = item.ocrText.split('\n').map(l => l.trim()).filter(Boolean);
  
  console.log('--- ALL LINES WITH CHINESE ---');
  lines.filter(l => /[\u4e00-\u9fa5]/.test(l) && !l.includes('佛光') && !l.includes('菜根')).forEach(l => console.log(l));
  
  console.log('--- ENGLISH LINES ---');
  lines.filter(l => /[A-Za-z]{3,}/.test(l) && !l.includes('Venerable') && !l.includes('Hsing') && !l.includes('Fare') && !l.includes('Humble') && !l.includes('Table')).slice(0, 8).forEach(l => console.log(l));
}
