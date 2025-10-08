const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');

const TRANSLATIONS_DIR = path.join(__dirname, '../translations');
const EN_FILE = path.join(TRANSLATIONS_DIR, 'en.json');
const PT_FILE = path.join(TRANSLATIONS_DIR, 'pt.json');

async function syncTranslations() {
  console.log('🌍 Starting translation sync...\n');

  // Read both files
  const enData = JSON.parse(fs.readFileSync(EN_FILE, 'utf-8'));
  const ptData = JSON.parse(fs.readFileSync(PT_FILE, 'utf-8'));

  // Find missing keys
  const missingKeys = Object.keys(enData).filter(key => !ptData[key]);

  if (missingKeys.length === 0) {
    console.log('✅ All translations are up to date!');
    return;
  }

  console.log(`📝 Found ${missingKeys.length} missing translations:\n`);

  // Translate missing keys
  for (const key of missingKeys) {
    try {
      console.log(`Translating: "${key}"`);
      const result = await translate(enData[key], { from: 'en', to: 'pt' });
      ptData[key] = result.text;
      console.log(`✓ "${result.text}"\n`);

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ Error translating "${key}":`, error.message);
      ptData[key] = enData[key]; // Fallback to English
    }
  }

  // Write updated Portuguese file
  fs.writeFileSync(PT_FILE, JSON.stringify(ptData, null, 2), 'utf-8');

  console.log(`\n✅ Translation sync complete! Updated ${missingKeys.length} translations.`);
}

syncTranslations().catch(error => {
  console.error('❌ Translation failed:', error);
  process.exit(1);
});
