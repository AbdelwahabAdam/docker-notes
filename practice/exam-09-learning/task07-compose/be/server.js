const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.end('LMS API placeholder');
}).listen(PORT, () => console.log(`API on ${PORT}`));
