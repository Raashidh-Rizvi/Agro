const http = require('http');

const registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(userData);

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 201) {
                    resolve(JSON.parse(responseBody));
                } else {
                    reject(new Error(`Status: ${res.statusCode}, Body: ${responseBody}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

async function createAccounts() {
    try {
        console.log('Creating Admin Account...');
        const adminData = {
            name: "Agro Admin",
            email: "admin_new@agro.lk",
            password: "AdminPassword123",
            role: "Admin"
        };
        const adminRes = await registerUser(adminData);
        console.log('✅ Admin account created.');
        console.log('Admin Email:', adminData.email);
        console.log('Admin Password:', adminData.password);
        
        console.log('\nCreating Farmer Account...');
        const farmerData = {
            name: "Agro Farmer",
            email: "farmer_new@agro.lk",
            password: "FarmerPassword123",
            role: "Farmer"
        };
        const farmerRes = await registerUser(farmerData);
        console.log('✅ Farmer account created.');
        console.log('Farmer Email:', farmerData.email);
        console.log('Farmer Password:', farmerData.password);

    } catch (err) {
        console.error('❌ Error creating accounts:', err.message);
    }
}

createAccounts();
