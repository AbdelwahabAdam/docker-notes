const http = require('http');
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.end(JSON.stringify({
    service: 'health-api',
    db: process.env.DB_HOST,
    env: process.env.APP_ENV
  }));
}).listen(PORT);
