import { generateTemplateVariables } from './src/template-variables.js';
import type { Mod } from './src/types.js';

// Test with a sample mod configuration
const testMod: Mod = {
  name: "TestMod",
  id: "testmod",
  package: "com.example.testmod",
  minecraftVersion: "1.21.4",
  loaders: ["fabric"],
  libraries: ["amber"],
  utility: ["modmenu"],
  samples: ["commands"],
  postActions: ["git-init"],
  license: "MIT",
  destinationPath: "/tmp/test-output",
  author: "TestAuthor",
  description: "A test mod",
  version: "1.0.0",
  javaVersion: "21"
};

async function testTemplateGeneration() {
  try {
    console.log('🧪 Testing template variable generation...');
    console.log('Input mod:', testMod);

    const variables = await generateTemplateVariables(testMod);

    console.log('\n✅ Template variables generated successfully!');
    console.log('\n📋 Key generated variables:');
    console.log(`- mod_name: ${variables.mod_name}`);
    console.log(`- mod_id: ${variables.mod_id}`);
    console.log(`- package_base: ${variables.package_base}`);
    console.log(`- package_path: ${variables.package_path}`);
    console.log(`- main_class_name: ${variables.main_class_name}`);
    console.log(`- constants_class_name: ${variables.constants_class_name}`);
    console.log(`- fabric_entry_class: ${variables.fabric_entry_class}`);
    console.log(`- java_version: ${variables.java_version}`);
    console.log(`- minecraft_version: ${variables.minecraft_version}`);
    console.log(`- amber_version: ${variables.amber_version}`);
    console.log(`- mod_menu_version: ${variables.mod_menu_version}`);

  } catch (error) {
    console.error('❌ Error generating template variables:', error);
    process.exit(1);
  }
}

testTemplateGeneration();