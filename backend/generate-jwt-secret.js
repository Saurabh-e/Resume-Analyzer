/**
 * JWT Secret Generator
 * Generates a cryptographically secure random string for JWT_SECRET
 * 
 * Usage: node generate-jwt-secret.js
 */

import crypto from 'crypto';

console.log('\n🔐 Generating Secure JWT Secret...\n');

// Generate 32 bytes (64 hex characters)
const secret = crypto.randomBytes(32).toString('hex');

console.log('✅ Generated JWT Secret:');
console.log('─'.repeat(70));
console.log(secret);
console.log('─'.repeat(70));

console.log('\n📋 Add this to your Render environment variables:');
console.log(`   JWT_SECRET=${secret}`);

console.log('\n⚠️  Keep this secret safe! Do not commit to git.\n');
