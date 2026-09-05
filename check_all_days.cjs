const fs = require('fs');

const ocr = JSON.parse(fs.readFileSync('oct_ocr.json', 'utf8'));
ocr.sort((a, b) => a.day - b.day);

for (let item of ocr) {
  console.log(`\n=================== DAY ${item.day} (${item.title}) ===================`);
  // Extract Chinese characters
  const lines = item.ocrText.split('\n');
  const chiLines = lines.filter(l => /[\u4e00-\u9fa5]{2,}/.test(l) && !l.includes('佛光') && !l.includes('菜根'));
  console.log('Chinese candidate lines:');
  chiLines.forEach(l => console.log('  ', l.trim()));
  console.log('English candidate lines:');
  const engLines = lines.filter(l => /^[A-Za-z\s,.'"-]{5,}$/.test(l.trim()));
  engLines.slice(0, 5).forEach(l => console.log('  ', l.trim()));
  console.log('Tagalog candidate lines:');
  const tagLines = lines.filter(l => /(Ang|sa|ng|na|mga|para|kung|kapag|basta)/i.test(l));
  tagLines.slice(0, 5).forEach(l => console.log('  ', l.trim()));
}
