const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'products');
const DISCOUNT = 0.40;
let count = 0;

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.md')) continue;
  const p = path.join(dir, file);
  let text = fs.readFileSync(p, 'utf8');

  if (!/^category:\s*["']?bags["']?\s*$/m.test(text)) continue;
  if (/^on_sale:\s*true/m.test(text)) continue;

  const m = text.match(/^price:\s*(\d+)\s*$/m);
  if (!m) continue;

  const original = parseInt(m[1], 10);
  const discounted = Math.round(original * (1 - DISCOUNT) / 100) * 100;

  // clear any old sale fields first
  text = text.replace(/^original_price:.*\n/m, '');
  text = text.replace(/^on_sale:.*\n/m, '');

  // set new price and add sale fields right after it
  text = text.replace(
    /^price:\s*\d+\s*$/m,
    'price: ' + discounted + '\non_sale: true\noriginal_price: ' + original
  );

  fs.writeFileSync(p, text);
  console.log('Sale: ' + file + ' (' + original + ' -> ' + discounted + ')');
  count++;
}
console.log('\nDone. ' + count + ' bags put on 40% off.');
