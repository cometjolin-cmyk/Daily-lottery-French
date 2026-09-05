const fs = require('fs');

async function main() {
  const url = 'https://drive.google.com/drive/folders/1h9MEkuhSjxUmTFeKeHBA3aXE-f-u5wg7';
  const res = await fetch(url);
  const text = await res.text();

  fs.writeFileSync('folder.html', text);

  // Search for file structures in Google Drive JS data payload
  // Typically filenames look like "31.jpg", "31.PNG", "31", etc. or image filenames
  const matches = [...text.matchAll(/\["([a-zA-Z0-9_-]{25,45})",\[?"([^"\]\n]+\.(?:jpg|png|jpeg|webp|PNG|JPG))"/g)];
  console.log('Match count:', matches.length);
  const results = [];
  for (const m of matches) {
    results.push({ id: m[1], filename: m[2] });
  }
  
  if (results.length === 0) {
    // Try matching any occurrences of "31", "32", ... "61" alongside file IDs
    const allTokens = [...text.matchAll(/["']([a-zA-Z0-9_-]{33})["']/g)].map(m => m[1]);
    console.log('Tokens with 33 chars:', Array.from(new Set(allTokens)).slice(0, 40));
  } else {
    console.log(JSON.stringify(results, null, 2));
  }
}

main().catch(console.error);
