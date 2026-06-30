const https = require('https');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Verify Paystack signature
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

  // Get product ID from payment reference metadata
  const metadata = payload.data.metadata;
  const productSlug = metadata?.custom_fields?.find(
    f => f.variable_name === 'product_slug'
  )?.value;

  if (!productSlug) {
    return { statusCode: 200, body: 'No product slug found' };
  }

  // Update product via GitHub API
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  // Get the file
  const getFile = () => new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/contents/src/products/${encodeURIComponent(productSlug)}.md`,
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'sisiologe-webhook'
      }
    };
    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
  });

  const fileData = await getFile();
  const content = Buffer.from(fileData.content, 'base64').toString('utf8');
  const updated = content.replace('available: true', 'available: false');
  const newContent = Buffer.from(updated).toString('base64');

  // Update the file
  const updateFile = () => new Promise((resolve, reject) => {
    const body = JSON.stringify({
      message: `Mark ${productSlug} as sold out`,
      content: newContent,
      sha: fileData.sha
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/contents/src/products/${encodeURIComponent(productSlug)}.md`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'sisiologe-webhook',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  await updateFile();

  return { statusCode: 200, body: 'Product marked as sold out' };
};