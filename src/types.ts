export interface ProjectConfig {
  useCurrentDir: boolean;
  projectName: string;
  projectTypes: string[];
  projectDir: string;
  installDeps: boolean;
}

export interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  [key: string]: any;
}