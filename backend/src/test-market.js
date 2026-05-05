const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:5000/api/market-prices');
        console.log('Status:', res.status);
        console.log('Data:', res.data);
    } catch (err) {
        console.log('Error Status:', err.response?.status);
        console.log('Error Data:', err.response?.data);
    }
}

test();
