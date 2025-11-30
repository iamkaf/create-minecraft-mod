package {{package_base}};

import net.fabricmc.api.ModInitializer;

/**
 * Fabric entry point.
 */
public class {{fabric_entry_class}} implements ModInitializer {

    @Override
    public void onInitialize() {
        {{main_class_name}}.init();
    }
}
