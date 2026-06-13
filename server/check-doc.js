const mongoose = require('mongoose');
const Resume = require('./models/Resume');
const config = require('./config');

async function checkDoc() {
  await mongoose.connect(config.mongoUri);
  const doc = await Resume.findById("6a2c2ae90eb8131d3225901b");
  console.log("Document generatedResume:", JSON.stringify(doc.generatedResume, null, 2));
  console.log("Document builderData:", JSON.stringify(doc.builderData, null, 2));
  process.exit(0);
}

checkDoc();
