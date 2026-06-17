import http from 'http';

const req = http.request('http://localhost:3001/health', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});
req.on('error', (e) => console.error(e));
req.end();
