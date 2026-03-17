const axios = require('axios');

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'jessi@gmail.com',
            password: 'password123', // I'm guessing here, or maybe it was set differently
            role: 'manager'
        });
        console.log('Login successful:', response.data);
    } catch (error) {
        console.log('Login failed:', error.response?.data || error.message);
    }
};

testLogin();
