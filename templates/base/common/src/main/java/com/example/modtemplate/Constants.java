package {{package_base}};

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class {{constants_class_name}} {
    /**
     * Mod identifier and configuration fields.
     * Update these fields when reusing this code for other projects.
     */
    public static final String MOD_ID = "{{mod_id}}";
    public static final String MOD_NAME = "{{mod_name}}";
    public static final Logger LOG = LoggerFactory.getLogger(MOD_NAME);
}
