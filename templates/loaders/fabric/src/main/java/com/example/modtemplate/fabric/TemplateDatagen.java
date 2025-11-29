package {{package_base}}.fabric;

import {{package_base}}.fabric.datagen.*;
import net.fabricmc.fabric.api.datagen.v1.DataGeneratorEntrypoint;
import net.fabricmc.fabric.api.datagen.v1.FabricDataGenerator;

/**
 * Datagen entry point for Fabric.
 */
public final class ModDatagen implements DataGeneratorEntrypoint {
    @Override
    public void onInitializeDataGenerator(FabricDataGenerator fabricDataGenerator) {
        FabricDataGenerator.Pack pack = fabricDataGenerator.createPack();

        pack.addProvider({{block_tag_provider_class}}::new);
        pack.addProvider({{item_tag_provider_class}}::new);
        pack.addProvider({{block_loot_provider_class}}::new);
        pack.addProvider({{model_provider_class}}::new);
        pack.addProvider({{recipe_provider_class}}.Runner::new);
    }
}
