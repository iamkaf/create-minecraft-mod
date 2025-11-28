package {{package_base}};

import {{package_base}}.{{constants_class_name}};
import {{package_base}}.{{main_class_name}};
import net.minecraft.world.InteractionResult;
import net.neoforged.bus.api.EventPriority;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.entity.player.PlayerInteractEvent;

import static net.minecraft.world.InteractionResult.*;

@Mod({{constants_class_name}}.MOD_ID)
public class {{neoforge_entry_class}} {
    public {{neoforge_entry_class}}(IEventBus eventBus) {
        {{main_class_name}}.init();

        NeoForge.EVENT_BUS.register(EventHandlerCommon.class);
    }

    static class EventHandlerCommon {
        @SubscribeEvent(priority = EventPriority.HIGH)
        public static void event(PlayerInteractEvent.EntityInteract event) {
            InteractionResult result = {{main_class_name}}.onPlayerEntityInteract(
                    event.getEntity(),
                    event.getLevel(),
                    event.getHand(),
                    event.getTarget()
            );
        }
    }
}