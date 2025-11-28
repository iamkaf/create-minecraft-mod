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

    /**
     * Example interaction handler demonstrating how shared logic can be used
     * across loaders. Replace or remove it as needed.
     */
    public static InteractionResult onPlayerEntityInteract(Player player, Level level, InteractionHand hand, Entity entity) {
        Constants.LOG.info(
                "{} interacted with {} using hand {} in level {}",
                player.getName().getString(),
                entity.getName().getString(),
                hand,
                level.dimension().location()
        );
        return InteractionResult.PASS;
    }
}
