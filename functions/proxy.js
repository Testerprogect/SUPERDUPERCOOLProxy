const http = require('http');
const https = require('https');
const { URL } = require('url');

exports.handler = async (event, context) => {
  const targetUrl = event.queryStringParameters?.url;
  
  if (!targetUrl) {
    return {
      statusCode: 400,
      body: 'URL parameter required. Usage: ?url=https://example.com'
    };
  }

  try {
    const url = new URL(targetUrl);
    const protocol = url.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      protocol.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: { 'Content-Type': res.headers['content-type'] || 'text/html' },
            body: data
          });
        });
      }).on('error', reject);
    });
  } catch (error) {
    return {
      statusCode: 502,
      body: 'Bad Gateway: ' + error.message
    };
  }
};
