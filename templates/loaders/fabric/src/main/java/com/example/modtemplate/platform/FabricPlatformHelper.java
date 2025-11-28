package {{package_base}}.platform;

import {{package_base}}.platform.services.IPlatformHelper;
import net.fabricmc.loader.api.FabricLoader;
import java.nio.file.Path;

public class {{fabric_platform_helper}} implements IPlatformHelper {

    @Override
    public String getPlatformName() {
        return "Fabric";
    }

    @Override
    public boolean isModLoaded(String modId) {

        return FabricLoader.getInstance().isModLoaded(modId);
    }

    @Override
    public boolean isDevelopmentEnvironment() {

        return FabricLoader.getInstance().isDevelopmentEnvironment();
    }

    @Override
    public Path getConfigDirectory() {
        return FabricLoader.getInstance().getConfigDir();
    }
}
