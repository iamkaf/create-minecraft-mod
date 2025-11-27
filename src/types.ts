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
  libraries: string[];
  utility: string[];
  samples: string[];
  postActions: string[];
  license: string;
  destinationPath: string;
}