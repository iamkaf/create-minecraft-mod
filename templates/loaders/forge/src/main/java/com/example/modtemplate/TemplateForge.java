package {{package_base}};

import {{package_base}}.{{constants_class_name}};
import {{package_base}}.{{main_class_name}};
import net.minecraftforge.fml.common.Mod;

@Mod({{constants_class_name}}.MOD_ID)
public class {{forge_entry_class}} {

    public {{forge_entry_class}}() {
        {{main_class_name}}.init();
    }
}