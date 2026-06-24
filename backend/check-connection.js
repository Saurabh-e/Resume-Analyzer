#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { promisify } from 'util';

dotenv.config();

const resolveSrv = promisify(dns.resolveSrv);

console.log('═══════════════════════════════════════════');
console.log('🔍 MongoDB Connection Diagnostic Tool');
console.log('═══════════════════════════════════════════\n');

// Extract hostname from connection string
const extractHostname = (uri) => {
  try {
    const match = uri.match(/@([^/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

const runDiagnostics = async () => {
  const uri = process.env.MONGODB_URI;

  // Step 1: Check if URI exists
  console.log('Step 1: Environment Variable Check');
  console.log('─────────────────────────────────────────');
  if (!uri) {
    console.log('❌ MONGODB_URI not found in .env file\n');
    process.exit(1);
  }
  console.log('✅ MONGODB_URI found');
  console.log(`📍 URI: ${uri.replace(/:[^:@]+@/, ':****@')}\n`);

  // Step 2: Parse connection string
  console.log('Step 2: Connection String Parsing');
  console.log('─────────────────────────────────────────');
  const isSRV = uri.startsWith('mongodb+srv://');
  console.log(`Format: ${isSRV ? 'SRV (mongodb+srv://)' : 'Standard (mongodb://)'}`);
  
  const hostname = extractHostname(uri);
  if (hostname) {
    console.log(`Host: ${hostname}`);
  }
  console.log();

  // Step 3: DNS Resolution Test (for SRV)
  if (isSRV && hostname) {
    console.log('Step 3: DNS Resolution Test');
    console.log('─────────────────────────────────────────');
    try {
      const srvRecordName = `_mongodb._tcp.${hostname}`;
      console.log(`Testing: ${srvRecordName}`);
      const records = await resolveSrv(srvRecordName);
      console.log(`✅ DNS resolution successful`);
      console.log(`Found ${records.length} server(s):`);
      records.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name}:${r.port}`);
      });
    } catch (error) {
      console.log(`❌ DNS resolution failed: ${error.message}`);
      console.log('\n💡 This usually means:');
      console.log('   - Network/Firewall blocking DNS queries');
      console.log('   - Invalid cluster hostname');
      console.log('   - Try using local MongoDB instead');
    }
    console.log();
  }

  // Step 4: MongoDB Connection Test
  console.log('Step 4: MongoDB Connection Test');
  console.log('─────────────────────────────────────────');
  
  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  let connected = false;
  
  try {
    console.log('Attempting connection...');
    await mongoose.connect(uri, options);
    connected = true;
    
    console.log('✅ Connection SUCCESSFUL!');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Ready State: ${mongoose.connection.readyState}`);
    
  } catch (error) {
    console.log('❌ Connection FAILED!');
    console.log(`Error: ${error.message}`);
    console.log(`Code: ${error.code || 'N/A'}`);
    
    console.log('\n💡 Common Solutions:');
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('   → Network/DNS issue detected');
      console.log('   1. Whitelist your IP in MongoDB Atlas (Network Access)');
      console.log('   2. Add 0.0.0.0/0 to allow all IPs');
      console.log('   3. Wait 2-3 minutes after whitelisting');
      console.log('   4. Check VPN/Firewall settings');
      console.log('   5. Try local MongoDB: mongodb://localhost:27017/ai-resume-analyzer');
    } else if (error.message.includes('authentication')) {
      console.log('   → Authentication issue');
      console.log('   1. Check username and password');
      console.log('   2. Verify user exists in Database Access');
    } else {
      console.log('   → See MONGODB_TROUBLESHOOTING.md for help');
    }
  } finally {
    if (connected) {
      await mongoose.connection.close();
      console.log('\nConnection closed.');
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(connected ? '✅ Diagnostics Complete - All Good!' : '❌ Diagnostics Complete - Issues Found');
  console.log('═══════════════════════════════════════════\n');
  
  process.exit(connected ? 0 : 1);
};

runDiagnostics();
