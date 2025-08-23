import { createServer } from 'http'; createServer((req, res) => { console.log('Request:', req.url); res.end('Test Server'); }).listen(3001, () => console.log('Listening 3001'));
