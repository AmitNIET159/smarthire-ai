const { generateText } = require('./services/aiService');

async function test() {
  try {
    console.log('Testing AI service with multi-model fallback...\n');
    const result = await generateText('Respond with exactly this JSON: {"status": "ok"}', { timeout: 60000 });
    console.log('\n=== SUCCESS ===');
    console.log('Response:', result.substring(0, 300));
  } catch (err) {
    console.log('\n=== FAILED ===');
    console.log(err.message.substring(0, 500));
  }
  process.exit(0);
}

test();
