const https = require('https');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret)
      .update(event.body)
      .digest('hex');

    if (hash !== event.headers['x-paystack-signature']) {
      return { statusCode: 401, body: 'Invalid signature' };
    }

    const payload = JSON.parse(event.body);

    if (payload.event !== 'charge.success') {
      return { statusCode: 200, body: 'OK' };
    }

    const data = payload.data;
    const metadata = data.metadata;
    const customFields = metadata?.custom_fields || [];

    const getField = (key) => customFields.find(f => f.variable_name === key)?.value || '';

    const slugsRaw = getField('product_slugs');
    const slugs = slugsRaw ? slugsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;

    // ===== PART 1: Mark all purchased products as sold out =====

    const getFile = (slug) => new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${repo}/contents/src/products/${encodeURIComponent(slug)}.md`,
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'sisiologe-webhook'
        }
      };
      const req = https.get(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(JSON.parse(body)));
      });
      req.on('error', reject);
    });

    const updateFile = (slug, fileData) => new Promise((resolve, reject) => {
      const content = Buffer.from(fileData.content, 'base64').toString('utf8');
      const updated = content.replace('available: true', 'available: false');
      const newContent = Buffer.from(updated).toString('base64');

      const body = JSON.stringify({
        message: `Mark ${slug} as sold out`,
        content: newContent,
        sha: fileData.sha
      });

      const options = {
        hostname: 'api.github.com',
        path: `/repos/${repo}/contents/src/products/${encodeURIComponent(slug)}.md`,
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'sisiologe-webhook',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let resBody = '';
        res.on('data', chunk => resBody += chunk);
        res.on('end', () => resolve(JSON.parse(resBody)));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    for (const slug of slugs) {
      try {
        const fileData = await getFile(slug);
        if (fileData && fileData.content) {
          await updateFile(slug, fileData);
        }
      } catch (err) {
        console.log(`Error marking ${slug} sold out:`, err.message);
      }
    }

    // ===== PART 2: Create an order record =====

    const createOrderFile = () => new Promise((resolve, reject) => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.getTime();
      const orderSlug = `order-${dateStr}-${timeStr}`;

      const customerName = getField('name') || 'Unknown';
      const phone = getField('phone') || '';
      const email = data.customer?.email || '';
      const items = getField('items') || slugsRaw;
      const total = (data.amount / 100).toString();
      const deliveryMethod = getField('delivery') || '';
      const deliveryDay = getField('delivery_day') || '';
      const address = getField('address') || '';
      const landmark = getField('landmark') || '';
      const notes = getField('notes') || '';
      const promo = getField('promo') || 'None';

      const fileContent = `---
customer_name: "${customerName.replace(/"/g, '\\"')}"
phone: "${phone}"
email: "${email}"
items: "${items.replace(/"/g, '\\"')}"
total: "${total}"
delivery_method: "${deliveryMethod}"
delivery_day: "${deliveryDay}"
address: "${address.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
landmark: "${landmark.replace(/"/g, '\\"')}"
notes: "${notes.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
promo: "${promo}"
date: ${now.toISOString()}
---
`;

      const encodedContent = Buffer.from(fileContent).toString('base64');

      const body = JSON.stringify({
        message: `New order from ${customerName}`,
        content: encodedContent
      });

      const options = {
        hostname: 'api.github.com',
        path: `/repos/${repo}/contents/src/orders/${orderSlug}.md`,
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'sisiologe-webhook',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let resBody = '';
        res.on('data', chunk => resBody += chunk);
        res.on('end', () => resolve(JSON.parse(resBody)));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    try {
      await createOrderFile();
    } catch (err) {
      console.log('Error creating order file:', err.message);
    }

    return { statusCode: 200, body: `Processed ${slugs.length} product(s) and created order record` };

  } catch (error) {
    console.log('Error:', error.message);
    return { statusCode: 200, body: 'Error handled' };
  }
};