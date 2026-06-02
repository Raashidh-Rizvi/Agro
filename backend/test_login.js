const http = require('http');

const loginUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ email, password });

        const options = {
            hostname: '192.168.8.106',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => { responseBody += chunk; });
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${responseBody}`);
                resolve(responseBody);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

async function testLogins() {
    console.log('=== Testing Admin Login ===');
    await loginUser('admin@agro.lk', 'AdminPassword@123');

    console.log('\n=== Testing Farmer Login ===');
    await loginUser('farmer@agro.lk', 'FarmerPassword@123');
}

testLogins();
