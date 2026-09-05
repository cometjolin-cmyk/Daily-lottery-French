const fs = require('fs');

const ocr = JSON.parse(fs.readFileSync('oct_ocr.json', 'utf8'));
ocr.sort((a, b) => a.day - b.day);

for (let d = 1; d <= 31; d++) {
  const item = ocr.find(i => i.day === d);
  console.log(`\n=== DAY ${d} ===`);
  if (!item) continue;
  const lines = item.ocrText.split('\n');
  const chi = lines.filter(l => /[\u4e00-\u9fa5]/.test(l));
  console.log(chi.join(' | '));
}
