const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, 'src/products');
const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.md'));

let resetCount = 0;

files.forEach(file => {
  const filePath = path.join(productsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const categoryMatch = content.match(/^category:\s*"?([\w-]+)"?/m);
  if (!categoryMatch || categoryMatch[1] !== 'bags') return;

  const onSaleMatch = content.match(/^on_sale:\s*(true|false)/m);
  if (!onSaleMatch || onSaleMatch[1] !== 'true') return;

  const originalMatch = content.match(/^original_price:\s*(\d+)/m);

  // Restore the old price if we have it
  if (originalMatch) {
    content = content.replace(/^price:\s*\d+/m, `price: ${originalMatch[1]}`);
  }

  // Turn sale off and remove the strikethrough price
  content = content.replace(/^on_sale:.*$/m, 'on_sale: false');
  content = content.replace(/^original_price:.*\n?/m, '');

  fs.writeFileSync(filePath, content, 'utf8');
  resetCount++;
  console.log(`Reset: ${file}${originalMatch ? ` (price back to ₦${originalMatch[1]})` : ' (no original price found, price unchanged)'}`);
});

console.log(`\nDone. ${resetCount} bags taken off sale.`);