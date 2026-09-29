const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const reviewer = (data.reviewer || 'Anonymous').trim();
    const rating = parseInt(data.rating) || 5;
    const comment = (data.comment || '').trim();

    if (!comment) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Comment is required' }) };
    }

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.getTime();
    const slug = `review-${dateStr}-${timeStr}`;

    const fileContent = `---
reviewer: "${reviewer.replace(/"/g, '\\"')}"
rating: ${rating}
comment: "${comment.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
date: ${now.toISOString()}
---
`;

    const encodedContent = Buffer.from(fileContent).toString('base64');

    const body = JSON.stringify({
      message: `New review from ${reviewer}`,
      content: encodedContent
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/contents/src/reviews-pending/${slug}.md`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'sisiologe-review-webhook',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let resBody = '';
        res.on('data', chunk => resBody += chunk);
        res.on('end', () => resolve(resBody));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (error) {
    console.log('Error:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Something went wrong' }) };
  }
};