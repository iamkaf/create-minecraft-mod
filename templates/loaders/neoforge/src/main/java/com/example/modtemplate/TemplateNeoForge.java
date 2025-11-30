package {{package_base}};

import {{package_base}}.{{constants_class_name}};
import {{package_base}}.{{main_class_name}};
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;

@Mod({{constants_class_name}}.MOD_ID)
public class {{neoforge_entry_class}} {
    public {{neoforge_entry_class}}(IEventBus eventBus) {
        {{main_class_name}}.init();
    }
}