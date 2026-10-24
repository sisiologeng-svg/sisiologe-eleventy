const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'products');
let count = 0;

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.md')) continue;
  const p = path.join(dir, file);
  let text = fs.readFileSync(p, 'utf8');

  if (!/^available:\s*["']?false["']?\s*$/m.test(text)) continue;
  if (!/^on_sale:\s*true/m.test(text)) continue;

  const o = text.match(/^original_price:\s*(\d+)\s*$/m);
  if (!o) continue;

  text = text.replace(/^price:\s*\d+\s*$/m, 'price: ' + o[1]);
  text = text.replace(/^on_sale:.*$/m, 'on_sale: false');
  text = text.replace(/^original_price:.*\n/m, '');

  fs.writeFileSync(p, text);
  console.log('Restored (sold): ' + file + ' (back to ' + o[1] + ')');
  count++;
}
console.log('\nDone. ' + count + ' sold items restored.');
