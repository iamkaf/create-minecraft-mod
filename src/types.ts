export interface Mod {
  name: string;
  id: string;
  package: string;
  minecraftVersion: string;
  loaders: string[];
  libraries: string[];
  utility: string[];
  samples: string[];
  postActions: string[];
  license: string;
}