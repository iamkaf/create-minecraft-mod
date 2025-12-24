package {{package_base}};

import {{package_base}}.platform.Services;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.Level;

/**
 * Common entry point for the mod.
 * Replace the contents with your own implementation.
 */
public class {{main_class_name}} {

    /**
     * Called during mod initialization for all loaders.
     */
    public static void init() {
        Constants.LOG.info("Initializing {} on {}...", Constants.MOD_NAME, Services.PLATFORM.getPlatformName());
    }
}
