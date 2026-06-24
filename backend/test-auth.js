import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

console.log('🧪 Testing Authentication Endpoints\n');
console.log('═══════════════════════════════════════════\n');

// Test 1: Health Check
const testHealth = async () => {
  try {
    console.log('Test 1: Health Check');
    console.log('─────────────────────────────────────────');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
    console.log('Response:', response.data);
    console.log();
    return true;
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('Error:', error.message);
    console.log('Make sure backend is running: cd backend && npm run dev');
    console.log();
    return false;
  }
};

// Test 2: Debug Endpoint
const testDebug = async () => {
  try {
    console.log('Test 2: Debug Info');
    console.log('─────────────────────────────────────────');
    const response = await axios.get(`${BASE_URL}/debug`);
    console.log('Server Status:', response.data);
    console.log();
    
    if (response.data.mongodb.status !== 1) {
      console.log('⚠️  WARNING: MongoDB is not connected!');
      console.log('MongoDB Status:', response.data.mongodb.status);
      console.log('0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting');
      console.log();
    }
    
    return response.data.mongodb.status === 1;
  } catch (error) {
    console.log('❌ Debug endpoint failed');
    console.log('Error:', error.message);
    console.log();
    return false;
  }
};

// Test 3: Register
const testRegister = async () => {
  try {
    console.log('Test 3: User Registration');
    console.log('─────────────────────────────────────────');
    
    const userData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`, // Unique email
      password: 'Test123'
    };
    
    console.log('Sending registration data:');
    console.log(JSON.stringify(userData, null, 2));
    console.log();
    
    const response = await axios.post(`${BASE_URL}/api/auth/register`, userData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    console.log();
    
    return { success: true, token: response.data.data?.token };
  } catch (error) {
    console.log('❌ Registration failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    console.log();
    return { success: false };
  }
};

// Test 4: Login
const testLogin = async (email, password) => {
  try {
    console.log('Test 4: User Login');
    console.log('─────────────────────────────────────────');
    
    const credentials = {
      email: email || 'test@example.com',
      password: password || 'Test123'
    };
    
    console.log('Sending login data:');
    console.log(JSON.stringify(credentials, null, 2));
    console.log();
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, credentials, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    console.log();
    
    return { success: true };
  } catch (error) {
    console.log('❌ Login failed');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    console.log();
    return { success: false };
  }
};

// Run all tests
const runTests = async () => {
  console.log('Starting tests...\n');
  
  // Test server
  const serverRunning = await testHealth();
  if (!serverRunning) {
    console.log('\n❌ Cannot proceed - server is not running');
    console.log('\nTo start the server:');
    console.log('1. cd backend');
    console.log('2. npm run dev');
    process.exit(1);
  }
  
  // Test debug
  const dbConnected = await testDebug();
  if (!dbConnected) {
    console.log('⚠️  WARNING: Tests will continue but may fail due to DB issues\n');
  }
  
  // Test register
  const registerResult = await testRegister();
  
  // Test login (try with a known account)
  await testLogin('test@example.com', 'Test123');
  
  console.log('═══════════════════════════════════════════');
  console.log('Tests Complete!\n');
  
  if (!dbConnected) {
    console.log('🔧 RECOMMENDATION:');
    console.log('   MongoDB is not connected. Please:');
    console.log('   1. Install MongoDB Community Edition');
    console.log('   2. Update backend/.env:');
    console.log('      MONGODB_URI=mongodb://localhost:27017/ai-resume-analyzer');
    console.log('   3. Restart backend server\n');
  }
  
  process.exit(0);
};

runTests();
