package {{package_base}};

import {{package_base}}.{{constants_class_name}};
import {{package_base}}.{{main_class_name}};
import net.minecraft.world.InteractionResult;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.event.entity.player.PlayerInteractEvent;
import net.minecraftforge.eventbus.api.EventPriority;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.common.Mod;

import static net.minecraft.world.InteractionResult.*;

@Mod({{constants_class_name}}.MOD_ID)
public class {{forge_entry_class}} {

    public {{forge_entry_class}}() {
        {{main_class_name}}.init();

        MinecraftForge.EVENT_BUS.register(EventHandlerCommon.class);
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