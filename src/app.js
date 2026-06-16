require('dotenv').config();
require('./cron/searchJobs');

const http = require('http');
const https = require('https');
const PORT = process.env.PORT || 10000; // Render uses PORT environment variable

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Job Agent is running.');
}).listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

// Self-ping to keep Render free tier instance from sleeping
const selfUrl = process.env.RENDER_EXTERNAL_URL;
if (selfUrl) {
  console.log(`Self-ping configured for: ${selfUrl}`);
  // Ping every 10 minutes (600,000 ms)
  setInterval(() => {
    https.get(selfUrl, (res) => {
      console.log(`Self-ping status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`Self-ping failed: ${err.message}`);
    });
  }, 10 * 60 * 1000);
}

console.log('Job Agent Started');