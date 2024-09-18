#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import { simpleGit } from 'simple-git';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const GITLAB_URL = process.env.GITLAB_URL || 'http://gitlab.cqlvc.com';
const TEMPLATE_REPO = process.env.TEMPLATE_REPO || '/spider-cloud/spider-cloud-template.git';

async function cloneTemplate(projectDir) {
  const git = simpleGit();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spider-cloud-template-'));
  
  try {
    await git.clone(`${GITLAB_URL}${TEMPLATE_REPO}`, tempDir);
    fs.copySync(tempDir, projectDir, { overwrite: true });
  } catch (error) {
    console.error('克隆模板失败:', error);
    throw error;
  } finally {
    fs.removeSync(tempDir);
  }
}

const projectChoices = [
  { name: 'PC', value: 'pc' },
  { name: 'H5', value: 'h5' },
  { name: 'IE', value: 'ie' },
  { name: 'Mobile', value: 'mobile' },
];

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

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useCurrentDir',
      message: '是否在当前目录创建项目？',
      default: false,
    },
    {
      type: 'input',
      name: 'projectName',
      message: '请输入项目名称：',
      when: (answers) => !answers.useCurrentDir,
      validate: (input) => {
        if (/^([A-Za-z\-_\d])+$/.test(input)) return true;
        else return '项目名称只能包含字母、数字、横线和下划线。';
      },
    },
    {
      type: 'checkbox',
      name: 'projectTypes',
      message: '请选择项目类型（可多选）：',
      choices: projectChoices,
      validate: (answer) => answer.length > 0 || '请至少选择一个项目类型',
    },
  ]);

  const { useCurrentDir, projectName, projectTypes } = answers;
  const currentDir = process.cwd();
  const projectDir = useCurrentDir ? currentDir : path.resolve(currentDir, projectName);
  const spinner = ora('正在创建项目...').start();

  try {
    if (!useCurrentDir) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    spinner.text = '正在从 GitLab 拉取模板文件...';
    await cloneTemplate(projectDir);

    // 复制 packages 目录
    projectTypes.forEach((type) => {
      const sourceDir = path.join(projectDir, `packages/${type}`);
      const destDir = path.join(projectDir, `packages/${type}`);
      if (fs.existsSync(sourceDir)) {
        fs.copySync(sourceDir, destDir);
      } else {
        console.warn(`警告：模板目录 ${sourceDir} 不存在`);
      }
    });

    // 复制根目录下除 packages 目录之外的所有文件和文件夹
    const files = fs.readdirSync(projectDir);
    files.forEach((file) => {
      const sourcePath = path.join(projectDir, file);
      const destPath = path.join(projectDir, file);
      // 排除 packages 目录
      if (file !== 'packages' && fs.existsSync(sourcePath)) {
        if (fs.lstatSync(sourcePath).isDirectory()) {
          fs.copySync(sourcePath, destPath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    });

    // 单独处理 .gitignore 和 .npmrc 文件
    fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignoreContent.trim());
    fs.writeFileSync(path.join(projectDir, '.npmrc'), npmrcContent.trim());

    // 复制 README.md 文件
    const readmePath = path.join(projectDir, 'README-zh_CN.md');
    if (fs.existsSync(readmePath)) {
      fs.copyFileSync(readmePath, path.join(projectDir, 'README.md'));
    } else {
      console.warn('警告：模板中缺少 README-zh_CN.md 文件');
    }

    // 修改 package.json 的项目名称
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = fs.readJsonSync(packageJsonPath);

    packageJson.name = useCurrentDir ? path.basename(currentDir) : projectName;

    fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

    spinner.succeed(chalk.green(`项目${useCurrentDir ? '' : ` ${projectName}`}已成功创建`));

    // 询问用户是否要安装依赖
    let installDeps = false;
    try {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installDeps',
          message: '是否现在安装依赖？',
          default: false,
        },
      ]);
      installDeps = answer.installDeps;
    } catch (error) {
      if (error.message.includes('User force closed the prompt')) {
        console.log(chalk.yellow('\n退出'));
      } else {
        throw error; // 重新抛出非预期的错误
      }
    }

    if (installDeps) {
      console.log(chalk.blue('\n正在安装依赖...'));
      execSync('pnpm install', { cwd: projectDir, stdio: 'inherit' });
      console.log(chalk.green('\n依赖安装完成！'));
    } else {
      console.log(chalk.yellow('\n您选择了不安装依赖。'));
    }

    console.log(chalk.yellow('\n下一步：'));
    if (!installDeps) {
      console.log(chalk.yellow('  1. 安装依赖：'));
      console.log(chalk.yellow('     pnpm install'));
    }
    console.log(chalk.yellow(`  ${installDeps ? '1' : '2'}. 启动项目：`));
    projectTypes.forEach((type) => {
      console.log(chalk.yellow(`     pnpm start:${type}`));
    });
  } catch (error) {
    if (error.message.includes('User force closed the prompt')) {
      console.log(chalk.yellow('\n您选择退出创建过程。'));
    } else {
      spinner.fail('项目创建失败');
      console.error('发生错误：', error);
    }
    process.exit(1);
  }
}

main().catch((error) => {
  if (error.message.includes('User force closed the prompt')) {
    console.log(chalk.yellow('\n您选择退出创建过程。'));
  } else {
    console.error('发生错误：', error);
  }
  process.exit(1);
});