const http = require('http');

async function testHealthEndpoint() {
  console.log('Testing CVPerfect Health Endpoint...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          console.log('\n✅ Health check passed!');
          console.log('- Status:', parsed.status);
          console.log('- Service:', parsed.service);
          console.log('- Orchestration:', parsed.orchestration);
          resolve(parsed);
        } else {
          reject(new Error(`Health check failed with status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Health check failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run the test
testHealthEndpoint()
  .then(() => {
    console.log('\n🎉 Health endpoint test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });