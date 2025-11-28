import { runPipeline } from './src/core.js';
import type { Mod } from './src/types.js';

const testMod: Mod = {
  name: "TestMod",
  id: "testmod",
  package: "com.example.testmod",
  minecraftVersion: "1.21.4",
  loaders: ["fabric"],
  libraries: [],
  utility: [],
  samples: [],
  postActions: [],
  license: "MIT",
  destinationPath: "/tmp/test-file-ops",
  author: "TestAuthor",
  description: "A test mod",
  version: "1.0.0",
  javaVersion: "21"
};

async function testFullPipeline() {
  try {
    console.log('🚀 Testing full pipeline...');
    console.log(`📁 Destination: ${testMod.destinationPath}`);

    await runPipeline(testMod);

    console.log('\n✅ Full pipeline completed successfully!');
    console.log(`📂 Check the output at: ${testMod.destinationPath}`);

  } catch (error) {
    console.error('❌ Error during pipeline:', error);
    process.exit(1);
  }
}

testFullPipeline();