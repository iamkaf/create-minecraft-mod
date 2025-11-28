Modrinth Maven
How do I use the Modrinth Maven?

Written by Emma Alexia

Updated over a month ago

All projects uploaded to Modrinth are automatically placed on a Maven repository. This can be used for a variation of reasons with a JVM build automation tool such as Gradle. This tool will not be of any use to an everyday user, but can be very useful for mod or plugin developers.

 

Gradle is the most common build automation tool used for Fabric, Forge, and Quilt mods, as such this guide will focus on Gradle. This guide can be adapted for use with Apache Maven (e.g. some Bukkit plugins) or any other build automation tool that supports Maven repositories.

Whenever possible, you should elect to use the Maven repository provided by the developer, if they have one. Most library mods will have their own Maven, especially if they make use of transitive dependencies or submodules.

 

This Maven is meant mostly to help with mod compatibility efforts, but can be used for some smaller libraries.

TL;DR
If you just want a quick rundown of how to add a dependency from the Maven, here's a build.gradle snippet:

repositories {
    exclusiveContent {
        forRepository {
            maven {
                name = "Modrinth"
                url = "https://api.modrinth.com/maven"
            }
        }
        forRepositories(fg.repository) // Only add this if you're using ForgeGradle, otherwise remove this line
        filter {
            includeGroup "maven.modrinth"
        }
    }
}

dependencies {
    modImplementation "maven.modrinth:lithium:mc1.19.2-0.10.0"
}
To learn what each part of this is and how to use it more extensively, read on!

 

Adding the repository
Conventional repository declaration
The Maven is located at https://api.modrinth.com/maven. To add it to a development environment, it must be added to your build.gradle(.kts) in the repositories block. For example, this is how it might look with the standard Groovy DSL and with the conventional repository declaration:

repositories {
    // ...
    maven {
        url = "https://api.modrinth.com/maven"
    }
}
Optionally, you may also add a repository name by adding name = "Modrinth" before the url. This may help debug logs be easier to read.

 

Advanced repository declaration (recommended)
Instead of the conventional repository declaration, it is recommended instead to make use of the relatively obscure Gradle feature that allows you to declare content exclusively found in one repository. The Maven group that Modrinth uses, maven.modrinth, won't be used anywhere else, so specifying that this group should only be resolved to our Maven will allow Gradle to resolve artifacts faster.

 

All in all, here's what an optimal repositories block with the Modrinth Maven repository might look like:

// Note: this is NOT the `repositories` block in `pluginManagement`! This is its own block.
repositories {
    // Other repositories can go above or below Modrinth's. We don't need priority :)
    exclusiveContent {
        forRepository {
            maven {
                name = "Modrinth"
                url = "https://api.modrinth.com/maven"
            }
        }
        forRepositories(fg.repository) // Only add this if you're using ForgeGradle, otherwise remove this line
        filter {
            includeGroup "maven.modrinth"
        }
    }
}
Resolving dependencies
Once added to the repositories block, resolving dependencies from the Maven is fairly simple. It is made up of three parts, just like every Maven artifact:

Maven group: The Maven group for all artifacts on the Maven will always be maven.modrinth.

Module: The archive name will be the slug or project ID of the project in question.

For example, with Sodium, you can use either sodium or AANobbMI.

Module version: The version will be the version number or ID. This can be found on the version page itself.

For example, with Sodium 0.4.4, you can use either mc1.19.2-0.4.4 or rAfhHfow.

Classifier (optional): Refer to Appendix: using classifiers.

Once you put these together and separate them with colons, you will get something like maven.modrinth:sodium:mc1.19.2-0.4.4. These are the coordinates. You can put the coordinates into the dependencies block in your build.gradle(.kts), prefaced with a configuration.

 

Dependency configuration
The configurations available to you will depend upon which Gradle plugin you are using.

 

Loom (Fabric, Quilt, Architectury)
With Loom, the available configurations will mostly be the same as those provided by the Java and Java library plugins, just prefaced with `mod` so that it can be remapped. For example, modImplementation will be the most common, though you can also use modApi, modCompileOnly, modRuntimeOnly, modLocalRuntime, and so on.

 

dependencies {
    // Adding and remapping a mod only in local runtime
    modLocalRuntime "maven.modrinth:sodium:mc1.19.2-0.4.4"
}
 

To include smaller libraries into your jar so that users don't have to install them separately, use include.

 

dependencies {
    // Adding a mod to a Fabric development environment as an API and including it within yours
    modApi include("maven.modrinth:trinkets:3.4.0")
}
 

Refer to Fabric Loom's documentation for more information. Note that Fabric's documentation is also mostly applicable to Quilt and Architectury Loom.

 

ForgeGradle
With ForgeGradle, you can use the standard configurations provided by the Java and Java library plugins. You will also have to add the fg.deobf scope to have it remapped.

 

dependencies {
    // Adding and remapping a mod at compile and runtime
    implementation fg.deobf("maven.modrinth:ferrite-core:5.0.1")
}
 

Maven version filters
Many projects on Modrinth elect to use the same version number for several different versions across multiple loaders and game versions. In cases like these, version filters can be used to select a specific version out of several that share the same version number.

 

To use them, put a dash and a comma-separated list of the loaders and game versions your version has:

// Get version `1.19.4-2.4.13` of `moonlight` for Forge mod loader
modImplementation "maven.modrinth:moonlight:1.19.4-2.4.13-forge"

// You can also put several filters into the list:
// Get version `3.0.9` of `physicsmod` for Fabric 1.20.2
modImplementation "maven.modrinth:physicsmod:3.0.9-fabric,1.20.2"
 

Appendix: transitive dependencies
Modrinth's Maven does not have any transitive dependencies. This can sometimes cause compilation problems and will often cause the development environment to have runtime problems.

 

For example, newer versions of Sodium depend on a library called JOML, but Modrinth has no way of knowing this, and as such the Maven does not have this dependency. One way to get around this is to locate the buildscript and copy over the dependency; for example, Sodium's dependency on JOML can be found here, and that line would also go in your buildscript.

 

Appendix: using classifiers (sources, Javadoc)
Sources, Javadoc, and other special classifiers will also be downloadable via the Maven assuming they are uploaded with the correct suffixes. For everything to work, the non-suffixed jar should be the primary file.

 

For example, if mymod-1.0.0+1.17.jar is the primary file, a source file named mymod-1.0.0+1.17-sources.jar and a Javadoc file named mymod-1.0.0+1.17-javadoc.jar can be automatically downloaded by an IDE if present. If a project has other files with similar classifiers, such as what lib39 has, you can add a fourth component to your dependency notation to get the individual file, such as maven.modrinth:lib39:1.3.1:gesundheit.
