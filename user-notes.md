# 🐛 Issues Found

## Dependencies

In our project there are 3 types of dependencies.

### Foundation dependencies

These are required to build and run the project. Think forge, fabric loader, neoforge, all gradle plugins. Completely handled by Gradle, always there.

Status: Already correctly integrated into the template and functioning well.

### Libraries

These are optional libraries that can be added to add functionality to the project. Once added they become required for the project to function. Think Architectury API, Amber, Cloth Config. They should be added by the CLI.

Status: Partially implemented. Currently only Amber is properly being added to all files via handlebars (gradle.properties, several build.gradle's, fabric.mod.json, mods.toml, neoforge.mods.toml, etc).

### Mods

These are optional utility mods that can be added to the project to improve the development experience. They can be added and removed at any time and are not required. Think JEI, Jade, Sodium. They should be added by the CLI.

Status: Implemented incorrectly. They are currently being called "utility mods". Currently they're being downloaded directly by the CLI and being added to the mods folder. This approach will immediately fail as soon as the user tries to update their project to the next version of Minecraft. We should transition to a new approach: the Modrinth Maven Repository...

#### Modrinth Maven Repository Behavior

The Modrinth maven repository supports flexible version specifications through mod loader suffixes and comma-separated Minecraft versions. Artifacts can be accessed with clean version strings like `8.1.0+1.21.10`, with explicit mod loader suffixes like `8.1.0+1.21.10-fabric` or `-neoforge`, or with additional comma-separated Minecraft versions like `8.1.0+1.21.10-fabric,1.21.10`. All valid variations resolve to the same underlying JAR file through redirects, but the repository validates version consistency and returns 404 for invalid combinations like mismatched Minecraft versions in the comma-separated portion.

##### Example Requests

###### Working Examples

```bash
# Clean version string
curl -I "https://api.modrinth.com/maven/maven/modrinth/amber/8.1.0+1.21.10/amber-8.1.0+1.21.10.pom"

# With mod loader suffix
curl -I "https://api.modrinth.com/maven/maven/modrinth/amber/8.1.0+1.21.10-fabric/amber-8.1.0+1.21.10-fabric.pom"

# NeoForge version
curl -I "https://api.modrinth.com/maven/maven/modrinth/amber/8.1.0+1.21.10-neoforge/amber-8.1.0+1.21.10-neoforge.pom"

# With comma-separated Minecraft version
curl -I "https://api.modrinth.com/maven/maven/modrinth/amber/8.1.0+1.21.10-fabric,1.21.10/amber-8.1.0+1.21.10-fabric,1.21.10.pom"
```

###### Non-working Example

```bash
# Invalid version combination (returns 404)
curl -I "https://api.modrinth.com/maven/maven/modrinth/amber/8.1.0+1.21.10-fabric,1.21.4/amber-8.1.0+1.21.10-fabric,1.21.4.pom"
```

For more detailed information see modrinth-maven.md.

## Licenses

Don't copy-paste text manually.

- **Source:** Use the **SPDX License List**. It’s the industry standard.
- **Implementation:** Use a package like `license` or `spdx-license-list` in Node. It gives you the full text of MIT, Apache 2.0, GPL, etc., which you can just inject into a `LICENSE` file.
- **UX:** Prompt: _"Which license?"_ -\> Default to `MIT` or `Apache 2.0`.

## Sample Code

Currently we have some sample code in the template that hooks into the player entity interact event and prints it. We'll remove that.

### How the optional samples will be added

Anchors.

Each sample will have a metadata json. This metadata will contain an array of objects that will define injection rules.

#### Sample Injection

There will be 2 modes for each entry:

- Copy: simply copy the file to the specified location, while processing the handlebars.

- Inject: inject the contents of the specified file into the specified anchor of the specified target file.