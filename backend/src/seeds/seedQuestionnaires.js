/**
 * seedQuestionnaires.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-shot seed script: connects to MongoDB and upserts all domain
 * questionnaire documents.
 *
 * Usage:
 *   node src/seeds/seedQuestionnaires.js
 *
 * The script uses UPSERT so it is idempotent — safe to run multiple times.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const DomainQuestionnaire = require('../models/DomainQuestionnaire');
const domainQuestionnaires = require('../data/domainQuestionnaires');

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('❌  MONGO_URI not found in .env');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || 'pathai'
  });
  console.log(`✅  Connected: ${mongoose.connection.host}`);

  let inserted = 0;
  let updated  = 0;

  for (const data of domainQuestionnaires) {
    // Convert the plain questions object into a Map (Mongoose requirement)
    const questionsMap = new Map(Object.entries(data.questions));

    const result = await DomainQuestionnaire.findOneAndUpdate(
      { domainName: data.domainName },
      {
        domainName:      data.domainName,
        displayName:     data.displayName,
        description:     data.description,
        startingPointId: data.startingPointId,
        questions:       questionsMap
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const wasNew = result.createdAt?.getTime() === result.updatedAt?.getTime();
    if (wasNew) {
      inserted++;
      console.log(`  ✨  Inserted: ${data.displayName} (${data.domainName})`);
    } else {
      updated++;
      console.log(`  🔄  Updated:  ${data.displayName} (${data.domainName})`);
    }
  }

  console.log(`\n📦  Seed complete — ${inserted} inserted, ${updated} updated.`);
  await mongoose.disconnect();
  console.log('🔌  Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
