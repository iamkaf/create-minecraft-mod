package {{package_base}}.fabric.datagen;

import net.fabricmc.fabric.api.datagen.v1.FabricDataOutput;
import net.fabricmc.fabric.api.datagen.v1.provider.FabricBlockLootTableProvider;
import net.minecraft.core.HolderLookup;

import java.util.concurrent.CompletableFuture;

/**
 * Generates block loot tables.
 */
public class {{block_loot_provider_class}} extends FabricBlockLootTableProvider {
    public {{block_loot_provider_class}}(FabricDataOutput dataOutput, CompletableFuture<HolderLookup.Provider> registryLookup) {
        super(dataOutput, registryLookup);
    }

    @Override
    public void generate() {
        // Add loot table generation here
    }
}
