import { runPipeline } from './src/core.js';
import type { Mod } from './src/types.js';

const testModWithUtilities: Mod = {
  name: "UtilityModsTest",
  id: "utilitymodstest",
  package: "com.example.utilitymodstest",
  minecraftVersion: "1.21.4",
  loaders: ["fabric", "neoforge"],
  libraries: [],
  utility: ["modmenu", "jei", "jade"],
  samples: [],
  postActions: [],
  license: "MIT",
  destinationPath: "/tmp/test-utility-mods",
  author: "TestAuthor",
  description: "A test mod with utility mods",
  version: "1.0.0",
  javaVersion: "21"
};

async function testUtilityMods() {
  console.log('🚀 Testing utility mods installation...');
  console.log(`📁 Destination: ${testModWithUtilities.destinationPath}`);
  console.log(`🔧 Loaders: ${testModWithUtilities.loaders.join(', ')}`);
  console.log(`🛠️  Utility mods: ${testModWithUtilities.utility.join(', ')}`);

  try {
    await runPipeline(testModWithUtilities);

    console.log('\n✅ Pipeline with utility mods completed successfully!');
    console.log(`📂 Check the output at: ${testModWithUtilities.destinationPath}`);

    // Check if mods directories were created
    const fs = await import('fs/promises');
    const path = await import('path');

    const fabricModsPath = path.join(testModWithUtilities.destinationPath, 'runs', 'client', 'mods');
    const neoforgeModsPath = path.join(testModWithUtilities.destinationPath, 'runs', 'mods');

    console.log('\n📦 Checking directory structure:');
    try {
      const fabricMods = await fs.readdir(fabricModsPath);
      console.log(`✅ Fabric mods directory: ${fabricMods.length} files`);
      fabricMods.forEach(file => console.log(`   - ${file}`));
    } catch {
      console.log('❌ Fabric mods directory not found');
    }

    try {
      const neoforgeMods = await fs.readdir(neoforgeModsPath);
      console.log(`✅ NeoForge mods directory: ${neoforgeMods.length} files`);
      neoforgeMods.forEach(file => console.log(`   - ${file}`));
    } catch {
      console.log('❌ NeoForge mods directory not found');
    }

  } catch (error) {
    console.error('❌ Error during pipeline:', error);
    process.exit(1);
  }
}

testUtilityMods();