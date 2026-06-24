/**
 * Backend Connection Checker
 * Run this script to verify backend connectivity
 * Usage: node check-backend.js
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env') });

const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = BACKEND_URL.replace('/api', '');

console.log('\n🔍 Checking Backend Connection...\n');
console.log(`Backend URL: ${BASE_URL}`);
console.log(`API URL: ${BACKEND_URL}\n`);

async function checkBackend() {
  try {
    // Check health endpoint
    console.log('📡 Testing /health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ Backend is running!');
      console.log(`   Environment: ${data.environment}`);
      console.log(`   MongoDB: ${data.mongodb}`);
      console.log(`   Timestamp: ${data.timestamp}\n`);
      
      // Check debug endpoint (development only)
      if (data.environment === 'development') {
        console.log('📡 Testing /debug endpoint...');
        const debugResponse = await fetch(`${BASE_URL}/debug`);
        if (debugResponse.ok) {
          const debugData = await debugResponse.json();
          console.log('✅ Debug endpoint accessible');
          console.log(`   MongoDB Status: ${debugData.mongodb.status === 1 ? 'Connected' : 'Disconnected'}`);
          console.log(`   Database: ${debugData.mongodb.name}\n`);
        }
      }
      
      return true;
    } else {
      console.log(`❌ Backend returned status: ${healthResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend!');
    console.log(`   Error: ${error.message}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solution:');
      console.log('   1. Make sure backend server is running');
      console.log('   2. Start backend: cd backend && npm start');
      console.log('   3. Verify backend is listening on port 5000\n');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Solution:');
      console.log('   1. Check VITE_API_URL in .env file');
      console.log('   2. Verify network connectivity\n');
    } else {
      console.log('💡 Check the error message above for details\n');
    }
    
    return false;
  }
}

// Run the check
checkBackend().then((success) => {
  if (success) {
    console.log('🎉 Everything looks good! You can start the frontend now.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Please fix the backend connection before starting frontend.\n');
    process.exit(1);
  }
});
