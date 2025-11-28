import { cloneTemplate, transformPackageStructure, updateJavaPackageDeclarations, renameClassFiles, applyTemplateVariables, generateServiceRegistrationFiles } from './src/core.js';
import type { Mod } from './src/types.js';

const testMod: Mod = {
  name: "TestMod",
  id: "testmod",
  package: "com.example.testmod",
  minecraftVersion: "1.21.4",
  loaders: ["fabric", "forge", "neoforge"],
  libraries: ["amber"],
  utility: ["modmenu"],
  samples: ["commands"],
  postActions: ["git-init"],
  license: "MIT",
  destinationPath: "/tmp/test-file-ops",
  author: "TestAuthor",
  description: "A test mod",
  version: "1.0.0",
  javaVersion: "21"
};

async function testFileOperations() {
  try {
    console.log('🧪 Testing file operations...');
    console.log(`📁 Destination: ${testMod.destinationPath}`);

    // Test template cloning
    console.log('\n1️⃣ Testing cloneTemplate...');
    await cloneTemplate(testMod);
    console.log('✅ Template cloned successfully!');

    // Test package structure transformation
    console.log('\n2️⃣ Testing transformPackageStructure...');
    await transformPackageStructure(testMod);
    console.log('✅ Package structure transformed successfully!');

    // Test Java package declarations update
    console.log('\n3️⃣ Testing updateJavaPackageDeclarations...');
    await updateJavaPackageDeclarations(testMod);
    console.log('✅ Java package declarations updated successfully!');

    // Test class file renaming
    console.log('\n4️⃣ Testing renameClassFiles...');
    await renameClassFiles(testMod);
    console.log('✅ Class files renamed successfully!');

    // Test template variable application
    console.log('\n5️⃣ Testing applyTemplateVariables...');
    await applyTemplateVariables(testMod);
    console.log('✅ Template variables applied successfully!');

    // Test service registration file generation
    console.log('\n6️⃣ Testing generateServiceRegistrationFiles...');
    await generateServiceRegistrationFiles(testMod);
    console.log('✅ Service registration files generated successfully!');

    console.log('\n🎉 All file operations completed successfully!');
    console.log(`📂 Check the output at: ${testMod.destinationPath}`);

  } catch (error) {
    console.error('❌ Error during file operations:', error);
    process.exit(1);
  }
}

testFileOperations();