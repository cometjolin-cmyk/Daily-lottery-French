const fs = require('fs');

const ocr = JSON.parse(fs.readFileSync('oct_ocr.json', 'utf8'));
const files = JSON.parse(fs.readFileSync('oct_files.json', 'utf8'));

ocr.sort((a, b) => a.day - b.day);

const summary = ocr.map(item => {
  return {
    day: item.day,
    title: item.title,
    id: item.id,
    image_url: item.image_url,
    rawText: item.ocrText
  };
});

fs.writeFileSync('oct_extracted.json', JSON.stringify(summary, null, 2));

for (let i = 0; i < summary.length; i += 5) {
  console.log(`\n--- Days ${i+1} to ${Math.min(i+5, summary.length)} ---`);
  summary.slice(i, i+5).forEach(s => {
    console.log(`\n[Day ${s.day}] (${s.title}) URL: ${s.image_url}`);
    console.log(s.rawText.split('\n').filter(l => l.trim()).slice(0, 15).join('\n'));
  });
}
