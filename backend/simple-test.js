const BASE_URL = 'http://localhost:5000';

console.log('🧪 Simple Authentication Test\n');

// Test Health
const testHealth = async () => {
  try {
    console.log('1️⃣  Testing server health...');
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Server is running');
    console.log('MongoDB:', data.mongodb || 'Unknown');
    console.log();
    return true;
  } catch (error) {
    console.log('❌ Server not reachable:', error.message);
    console.log('\n💡 Make sure backend is running:');
    console.log('   cd backend && npm run dev\n');
    return false;
  }
};

// Test Register
const testRegister = async () => {
  try {
    console.log('2️⃣  Testing registration...');
    const userData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test123'
    };
    
    console.log('Sending:', JSON.stringify(userData));
    
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('User ID:', data.data?.user?._id);
      console.log();
      return true;
    } else {
      console.log('❌ Registration failed');
      console.log('Status:', response.status);
      console.log('Message:', data.message);
      console.log('Full response:', JSON.stringify(data, null, 2));
      console.log();
      return false;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    console.log();
    return false;
  }
};

// Test Login
const testLogin = async () => {
  try {
    console.log('3️⃣  Testing login...');
    const credentials = {
      email: 'test@example.com',
      password: 'Test123'
    };
    
    console.log('Sending:', JSON.stringify(credentials));
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log();
      return true;
    } else {
      console.log('❌ Login failed');
      console.log('Status:', response.status);
      console.log('Message:', data.message);
      console.log();
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    console.log();
    return false;
  }
};

// Run tests
const runTests = async () => {
  const serverOk = await testHealth();
  
  if (!serverOk) {
    console.log('❌ Cannot continue - server not accessible\n');
    process.exit(1);
  }
  
  await testRegister();
  await testLogin();
  
  console.log('═══════════════════════════════════════════');
  console.log('✅ Tests complete!\n');
  
  console.log('If tests failed, check:');
  console.log('1. MongoDB is connected (see backend logs)');
  console.log('2. No rate limiting errors (429)');
  console.log('3. Request body is being parsed correctly\n');
};

runTests();
