package {{package_base}};

import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.event.player.UseEntityCallback;

/**
 * Fabric entry point.
 */
public class {{fabric_entry_class}} implements ModInitializer {

    @Override
    public void onInitialize() {
        {{main_class_name}}.init();

        UseEntityCallback.EVENT.register((player, level, hand, entity, hitResult) ->
                {{main_class_name}}.onPlayerEntityInteract(player, level, hand, entity));
    }
}
