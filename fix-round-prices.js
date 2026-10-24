const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'products');
let count = 0;

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.md')) continue;
  const p = path.join(dir, file);
  let text = fs.readFileSync(p, 'utf8');

  if (!/^category:\s*["']?bags["']?\s*$/m.test(text)) continue;
  if (/^on_sale:\s*true/m.test(text)) continue;

  const m = text.match(/^price:\s*(\d+)\s*$/m);
  if (!m) continue;

  const price = parseInt(m[1], 10);
  const rem = price % 1000;
  if (rem !== 0 && (rem >= 990 || rem <= 10)) {
    const rounded = Math.round(price / 1000) * 1000;
    text = text.replace(/^price:\s*\d+\s*$/m, 'price: ' + rounded);
    fs.writeFileSync(p, text);
    console.log('Rounded: ' + file + ' (' + price + ' -> ' + rounded + ')');
    count++;
  }
}
console.log('\nDone. ' + count + ' prices rounded.');
