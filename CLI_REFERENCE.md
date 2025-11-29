# create-minecraft-mod CLI Reference

Quick reference for the Minecraft mod creation CLI tool.

## Quick Start

```bash
# Interactive mode (default)
create-minecraft-mod ./my-mod

# CI/headless mode
create-minecraft-mod ./my-mod --ci-mode --name "My Mod" --author "Your Name"

# Config file mode
create-minecraft-mod ./my-mod --config ./config.json
```

## CLI Modes

| Mode | When to Use | Command |
|------|-------------|---------|
| **Interactive** | First-time users, exploring options | `create-minecraft-mod ./my-mod` |
| **CI/Headless** | Automation, CI/CD pipelines | `--ci-mode` + required flags |
| **Config** | Reusable team configurations | `--config <file>` |

## Interactive Mode

Start the guided prompt sequence:

```bash
create-minecraft-mod [destination-path]
```

**Key Prompts:**
- Destination path
- Mod name, author, description, version
- Java version (17 or 21)
- Mod ID and Java package (auto-generated)
- Minecraft version (1.21.10, 1.21.1, 1.20.1)
- Mod loaders (Fabric, Forge, NeoForge)
- Libraries and utility mods
- License and post-creation actions

**Note:** Fabric Loom version is automatically fetched from Echo Registry - no manual selection needed.

## CI Mode

Non-interactive mode for automation:

```bash
create-minecraft-mod ./my-mod --ci-mode --name "My Mod" --author "Your Name"
```

**Required Flags:**
- `--ci-mode` - Enable CI mode
- `--name <string>` - Mod name
- `--author <string>` - Mod author

**Common Optional Flags:**
- `--minecraft <version>` - Minecraft version
- `--loaders <list>` - Comma-separated (fabric,forge,neoforge)
- `--libraries <list>` - Comma-separated library IDs
- `--license <type>` - mit, lgpl, arr
- `--output-format json` - JSON output for CI

**Examples:**
```bash
# Basic CI mode
create-minecraft-mod ./my-mod --ci-mode --name "My Mod" --author "Me"

# Multi-loader with JSON output
create-minecraft-mod ./my-mod --ci-mode --name "My Mod" --author "Me" --loaders "fabric,forge" --output-format json

# Skip Gradle for faster CI
create-minecraft-mod ./my-mod --ci-mode --name "My Mod" --author "Me" --skip-gradle

```

## Config Mode

Use JSON configuration files:

```bash
create-minecraft-mod ./my-mod --config ./config.json
```

**JSON Config Structure:**
```json
{
  "mod": {
    "name": "My Cool Mod",
    "author": "Your Name",
    "id": "my-cool-mod",
    "description": "A test mod",
    "package": "com.example.mycoolmod",
    "minecraftVersion": "1.21.10",
    "javaVersion": "21",
    "fabricLoomVersion": "1.12"
  },
  "options": {
    "loaders": ["fabric", "forge"],
    "libraries": ["amber", "cloth-config"],
    "utility": ["modmenu", "jei", "sodium"],
    "license": "mit"
  },
  "pipeline": {
    "skipGradle": false,
    "skipGit": false,
    "skipIde": false,
    "outputFormat": "text"
  }
}
```

**CLI Override:**
CLI arguments override config file values:
```bash
create-minecraft-mod ./my-mod --config ./config.json --name "Override Name"
```

## Command Reference

### Core Options
- `destination-path` - Where to create the mod (optional)
- `--help, -h` - Show help message
- `--ci-mode` - Enable non-interactive mode
- `--config <path>` - Use JSON configuration file

### Mod Configuration
- `--name <string>` - Mod name
- `--author <string>` - Mod author
- `--id <string>` - Mod ID (alphanumeric, lowercase)
- `--description <string>` - Mod description
- `--package <string>` - Java package name
- `--minecraft <version>` - Minecraft version (1.21.10, 1.21.1, 1.20.1)
- `--java-version <version>` - Java version (17, 21)
- `--loaders <list>` - Comma-separated loaders (fabric,forge,neoforge)
- `--libraries <list>` - Comma-separated library IDs
- `--mods <list>` - Comma-separated utility mods
- `--license <type>` - License type (mit, lgpl, arr)

### Pipeline Control
- `--skip-gradle` - Skip Gradle execution
- `--skip-git` - Skip git initialization
- `--skip-ide` - Skip IDE opening
- `--output-format <format>` - Output format (text, json)

## Valid Values

### Minecraft Versions
- `1.21.10` (latest)
- `1.21.1`
- `1.20.1`

### Mod Loaders
- `fabric` - Fabric Loader
- `forge` - Minecraft Forge
- `neoforge` - NeoForge

### License Types
- `mit` - MIT License
- `lgpl` - GNU Lesser GPL
- `arr` - All Rights Reserved

### Output Formats
- `text` - Human readable (default)
- `json` - Machine readable for CI/CD

## Exit Codes
- `0` - Success
- `1` - Error or invalid configuration