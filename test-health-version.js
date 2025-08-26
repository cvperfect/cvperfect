const http = require('http');

function get(pathname) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 3000, path: pathname, method: 'GET' }, res => {
      let data=''; res.on('data', c => data+=c); res.on('end', ()=>resolve({ code:res.statusCode, body:data }));
    });
    req.on('error', reject); req.end();
  });
}

(async () => {
  const res = await get('/api/health');
  if (res.code !== 200) { console.error('FAIL: status', res.code); process.exit(1); }
  const json = JSON.parse(res.body);
  if (!json.version || typeof json.version !== 'string') { console.error('FAIL: version missing'); process.exit(1); }
  console.log('PASS: health version =', json.version);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });