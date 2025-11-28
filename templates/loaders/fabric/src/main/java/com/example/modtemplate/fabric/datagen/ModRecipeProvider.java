package {{package_base}}.fabric.datagen;

import {{package_base}}.{{constants_class_name}};
import net.fabricmc.fabric.api.datagen.v1.FabricDataOutput;
import net.fabricmc.fabric.api.datagen.v1.provider.FabricRecipeProvider;
import net.minecraft.core.HolderLookup;
import net.minecraft.data.recipes.RecipeOutput;
import net.minecraft.data.recipes.RecipeProvider;
import org.jetbrains.annotations.NotNull;

import java.util.concurrent.CompletableFuture;

/**
 * Generates crafting recipes.
 */
public class {{recipe_provider_class}} extends RecipeProvider {
    protected {{recipe_provider_class}}(HolderLookup.Provider provider, RecipeOutput recipeOutput) {
        super(provider, recipeOutput);
    }

    @Override
    public void buildRecipes() {
        // Add recipe generation here
    }

    public static class Runner extends FabricRecipeProvider {
        public Runner(FabricDataOutput output, CompletableFuture<HolderLookup.Provider> registriesFuture) {
            super(output, registriesFuture);
        }

        @Override
        protected @NotNull RecipeProvider createRecipeProvider(HolderLookup.@NotNull Provider registries, @NotNull RecipeOutput output) {
            return new {{recipe_provider_class}}(registries, output);
        }

        @Override
        public @NotNull String getName() {
            return {{constants_class_name}}.MOD_ID + " Recipes";
        }
    }
}
