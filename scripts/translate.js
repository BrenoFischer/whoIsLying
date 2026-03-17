const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');

const TRANSLATIONS_DIR = path.join(__dirname, '../translations');
const EN_FILE = path.join(TRANSLATIONS_DIR, 'en.json');
const PT_FILE = path.join(TRANSLATIONS_DIR, 'pt.json');
const CATS_EN_FILE = path.join(TRANSLATIONS_DIR, 'categories.en.json');
const CATS_PT_FILE = path.join(TRANSLATIONS_DIR, 'categories.pt.json');
const CATEGORIES_FILE = path.join(__dirname, '../data/categories.json');

async function syncFile(enFile, ptFile, label, retranslateIdentical = false) {
  const enData = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
  const ptData = JSON.parse(fs.readFileSync(ptFile, 'utf-8'));

  const missingKeys = Object.keys(enData).filter(
    key => !ptData[key] || (retranslateIdentical && ptData[key] === enData[key])
  );

  if (missingKeys.length === 0) {
    console.log(`✅ ${label}: all translations up to date!`);
    return;
  }

  console.log(`📝 ${label}: found ${missingKeys.length} missing translations\n`);

  for (const key of missingKeys) {
    try {
      console.log(`Translating: "${key}"`);
      const result = await translate(enData[key], { from: 'en', to: 'pt' });
      ptData[key] = result.text;
      console.log(`✓ "${result.text}"\n`);
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(`❌ Error translating "${key}":`, error.message);
      ptData[key] = enData[key];
    }
  }

  fs.writeFileSync(ptFile, JSON.stringify(ptData, null, 2), 'utf-8');
  console.log(`\n✅ ${label}: updated ${missingKeys.length} translations.\n`);
}

function syncCategoriesEnJson() {
  const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf-8'));
  const catsEn = JSON.parse(fs.readFileSync(CATS_EN_FILE, 'utf-8'));

  let added = 0;
  for (const cat of Object.values(categories)) {
    // Questions
    for (const questions of Object.values(cat.questions)) {
      for (const q of questions) {
        if (!(q in catsEn)) {
          catsEn[q] = q;
          added++;
        }
      }
    }
    // Word descriptions (values are already translation keys, not raw strings)
    for (const [word, descKey] of Object.entries(cat.wordDescriptions)) {
      if (!(descKey in catsEn)) {
        catsEn[descKey] = descKey;
        added++;
      }
    }
  }

  if (added > 0) {
    fs.writeFileSync(CATS_EN_FILE, JSON.stringify(catsEn, null, 2), 'utf-8');
    console.log(`📋 categories.en.json: added ${added} new strings from categories.json\n`);
  } else {
    console.log(`✅ categories.en.json: already in sync with categories.json\n`);
  }
}

async function main() {
  console.log('🌍 Starting translation sync...\n');

  // Step 1: sync categories.json → categories.en.json
  syncCategoriesEnJson();

  // Step 2: sync categories.en.json → categories.pt.json
  await syncFile(CATS_EN_FILE, CATS_PT_FILE, 'categories', true);

  // Step 3: sync en.json → pt.json
  await syncFile(EN_FILE, PT_FILE, 'UI strings');

  console.log('🎉 All done!');
}

main().catch(error => {
  console.error('❌ Translation failed:', error);
  process.exit(1);
});
