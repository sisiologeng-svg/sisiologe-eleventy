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

    const metadata = payload.data.metadata;
    const customFields = metadata?.custom_fields || [];
    const slugsRaw = customFields.find(
      f => f.variable_name === 'product_slugs'
    )?.value;

    if (!slugsRaw) {
      return { statusCode: 200, body: 'No product slugs found' };
    }

    const slugs = slugsRaw.split(',').map(s => s.trim()).filter(Boolean);
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;

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
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
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
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    // Process each product slug one at a time (sequential to avoid GitHub API race conditions)
    for (const slug of slugs) {
      try {
        const fileData = await getFile(slug);
        if (fileData && fileData.content) {
          await updateFile(slug, fileData);
        }
      } catch (err) {
        console.log(`Error processing ${slug}:`, err.message);
        // Continue to next slug even if one fails
      }
    }

    return { statusCode: 200, body: `Processed ${slugs.length} product(s)` };

  } catch (error) {
    console.log('Error:', error.message);
    return { statusCode: 200, body: 'Error handled' };
  }
};