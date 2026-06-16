require('dotenv').config();
require('./cron/searchJobs');

const http = require('http');
const PORT = process.env.PORT || 10000; // Render uses PORT environment variable

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Job Agent is running.');
}).listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

console.log('Job Agent Started');