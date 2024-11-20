import fs from 'fs-extra';
import path from 'path';
import { ProjectConfig } from '../types.js';

const gitignoreContent = `
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
.DS_Store
dist
*.local

# Editor directories and files
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# 构建产物
dist/
build/

# 环境变量文件
.env.local
.env.*.local

# 缓存文件
.cache/
.temp/

# 测试覆盖率报告
coverage/

# Vite 生成的类型文件
*.d.ts
`;

const npmrcContent = `
registry="https://registry.npmmirror.com"
strict-peer-dependencies=false
`;

export async function copyFiles(templateDir: string, config: ProjectConfig) {
  // 复制选定的 packages 目录
  config.projectTypes.forEach((type) => {
    const sourceDir = path.join(templateDir, `packages/${type}`);
    const destDir = path.join(config.projectDir, `packages/${type}`);
    if (fs.existsSync(sourceDir)) {
      fs.copySync(sourceDir, destDir);
    } else {
      console.warn(`警告：模板目录 ${sourceDir} 不存在`);
    }
  });

  // 复制根目录下的文件和文件夹（除了 packages 目录）
  const files = fs.readdirSync(templateDir);
  files.forEach((file) => {
    const sourcePath = path.join(templateDir, file);
    const destPath = path.join(config.projectDir, file);
    if (file !== 'packages' && fs.existsSync(sourcePath)) {
      if (fs.lstatSync(sourcePath).isDirectory()) {
        fs.copySync(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  });
}

export async function writeFiles(config: ProjectConfig) {
  // 单独处理 .gitignore 和 .npmrc 文件
  fs.writeFileSync(path.join(config.projectDir, '.gitignore'), gitignoreContent.trim());
  fs.writeFileSync(path.join(config.projectDir, '.npmrc'), npmrcContent.trim());

  // 复制 README.md 文件
  const readmePath = path.join(config.projectDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    fs.copyFileSync(readmePath, path.join(config.projectDir, 'README.md'));
  } else {
    console.warn('警告：模板中缺少 README.md 文件');
  }
}

export async function cleanupFiles(config: ProjectConfig) {
  // 清理不需要的文件和目录，但保留当前目录的 .git
  const unnecessaryFiles = ['.gitlab-ci.yml', 'README.md'];
  unnecessaryFiles.forEach(file => {
    const filePath = path.join(config.projectDir, file);
    if (fs.existsSync(filePath)) {
      fs.removeSync(filePath);
    }
  });
}