import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Testing Environment Variables:\n');
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ Missing');
console.log('PORT:', process.env.PORT || '❌ Missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded (hidden)' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded (hidden)' : '❌ Missing');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Loaded (hidden)' : '❌ Missing');

console.log('\n📝 Full GROQ_API_KEY check:');
console.log('Length:', process.env.GROQ_API_KEY?.length || 0);
console.log('First 10 chars:', process.env.GROQ_API_KEY?.substring(0, 10) || 'None');

if (process.env.GROQ_API_KEY) {
  console.log('\n✅ All environment variables loaded successfully!');
} else {
  console.log('\n❌ GROQ_API_KEY is missing!');
}
