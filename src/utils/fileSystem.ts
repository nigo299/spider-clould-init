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
  // 并发复制选定的 packages 目录
  await Promise.all(
    config.projectTypes.map(async (type) => {
      const sourceDir = path.join(templateDir, `packages/${type}`);
      const destDir = path.join(config.projectDir, `packages/${type}`);
      try {
        if (await fs.pathExists(sourceDir)) {
          await fs.copy(sourceDir, destDir);
        } else {
          console.warn(`警告：模板目录 ${sourceDir} 不存在`);
        }
      } catch (err) {
        console.warn(`复制 ${type} 目录时出错:`, err);
      }
    })
  );

  // 并发复制根目录下的文件和文件夹（除了 packages 目录）
  const files = await fs.readdir(templateDir);
  await Promise.all(
    files.map(async (file) => {
      const sourcePath = path.join(templateDir, file);
      const destPath = path.join(config.projectDir, file);
      if (file !== 'packages' && await fs.pathExists(sourcePath)) {
        try {
          const stat = await fs.lstat(sourcePath);
          if (stat.isDirectory()) {
            await fs.copy(sourcePath, destPath);
          } else {
            await fs.copyFile(sourcePath, destPath);
          }
        } catch (err) {
          console.warn(`复制文件 ${file} 时出错:`, err);
        }
      }
    })
  );
}

export async function writeFiles(config: ProjectConfig) {
  try {
    await fs.writeFile(path.join(config.projectDir, '.gitignore'), gitignoreContent.trim());
    await fs.writeFile(path.join(config.projectDir, '.npmrc'), npmrcContent.trim());
  } catch (err) {
    console.warn('写入 .gitignore 或 .npmrc 时出错:', err);
  }
  // 复制 README.md 文件
  const readmePath = path.join(config.projectDir, 'README.md');
  try {
    if (await fs.pathExists(readmePath)) {
      await fs.copyFile(readmePath, path.join(config.projectDir, 'README.md'));
    } else {
      console.warn('警告：模板中缺少 README.md 文件');
    }
  } catch (err) {
    console.warn('复制 README.md 时出错:', err);
  }
}

export async function cleanupFiles(config: ProjectConfig) {
  // 清理不需要的文件和目录，但保留当前目录的 .git
  const unnecessaryFiles = ['.gitlab-ci.yml', 'README.md'];
  await Promise.all(
    unnecessaryFiles.map(async (file) => {
      const filePath = path.join(config.projectDir, file);
      try {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      } catch (err) {
        console.warn(`清理文件 ${file} 时出错:`, err);
      }
    })
  );
}