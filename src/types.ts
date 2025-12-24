export interface Mod {
  name: string;
  id: string;
  package: string;
  author: string;
  description: string;
  version: string;
  javaVersion: string;
  minecraftVersion: string;
  loaders: string[];
  libraries: string[];      // Development libraries that become required when selected
  mods: string[];          // Runtime mods that remain optional and removable
  samples: string[];
  postActions: string[];
  license: string;
  destinationPath: string;
  fabricLoomVersion?: string;
  gradleVersion?: string;
}