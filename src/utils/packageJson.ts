import fs from 'fs-extra';
import path from 'path';
import { ProjectConfig, PackageJson } from '../types.js';

export async function modifyPackageJson(config: ProjectConfig) {
  const packageJsonPath = path.join(config.projectDir, 'package.json');
  const packageJson: PackageJson = await fs.readJson(packageJsonPath);

  packageJson.name = config.useCurrentDir ? path.basename(config.projectDir) : config.projectName;

  // 修改 scripts
  const relevantScripts = getRelevantScripts(config.projectTypes);
  packageJson.scripts = { ...relevantScripts, ...getCommonScripts() };

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
}

function getRelevantScripts(projectTypes: string[]): Record<string, string> {
  const relevantScripts: Record<string, string> = {};

  projectTypes.forEach(type => {
    switch (type) {
      case 'pc':
        Object.assign(relevantScripts, {
          "build:pc": "pnpm run --filter @web/pc build",
          "build-test:pc": "pnpm run --filter @web/pc build-test",
          "clean:pc": "pnpm run --filter @web/pc clean",
          "start:pc": "pnpm run --filter @web/pc start",
          "preview:pc": "pnpm run --filter @web/pc preview"
        });
        break;
      case 'h5':
        Object.assign(relevantScripts, {
          "build:h5": "pnpm run --filter @web/h5 build",
          "build-test:h5": "pnpm run --filter @web/h5 build-test",
          "clean:h5": "pnpm run --filter @web/h5 clean",
          "start:h5": "pnpm run --filter @web/h5 start",
          "preview:h5": "pnpm run --filter @web/h5 preview"
        });
        break;
      case 'ie':
        Object.assign(relevantScripts, {
          "start:ie": "pnpm run --filter @web/ie dev",
          "build:ie": "pnpm run --filter @web/ie build-test"
        });
        break;
      case 'mobile':
        Object.assign(relevantScripts, {
          "start:mobile-h5": "pnpm run --filter @web/mobile dev",
          "start:mobile-mp": "pnpm run --filter @web/mobile dev:mp",
          "build:mobile-h5": "pnpm run --filter @web/mobile build:h5",
          "build:mobile-mp": "pnpm run --filter @web/mobile build:mp"
        });
        break;
    }
  });

  return relevantScripts;
}

function getCommonScripts(): Record<string, string> {
  return {
    "commit": "git add . && git-cz",
    "prepare": "husky",
    "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix",
    "format": "prettier --write .",
    "deps:check": "taze",
    "deps:update": "taze major -w",
    "deps:patch": "taze patch -w",
    "deps:write": "taze write -w"
  };
}
