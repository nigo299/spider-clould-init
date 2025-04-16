import { ProjectConfig } from '../types.js';
import { promptForConfig } from '../utils/prompt.js';
import { cloneTemplate } from '../utils/git.js';
import { copyFiles, writeFiles, cleanupFiles } from '../utils/fileSystem.js';
import { modifyPackageJson } from '../utils/packageJson.js';
import { installDependencies } from '../utils/dependencies.js';
import { ProgressManager } from '../utils/progress.js';
import chalk from 'chalk';

const progress = new ProgressManager();

export async function createProject() {
  try {
    const config = await promptForConfig();
    const steps = getProjectSteps(config.installDeps);
    progress.initSteps(steps);
    await runProjectCreationPipeline(config);
    printSuccessInfo(config);
  } catch (error) {
    handleError(error);
  }
}

function getProjectSteps(installDeps: boolean): string[] {
  const steps = [
    '创建项目目录',
    '克隆项目模板',
    '复制项目文件',
    '配置项目信息',
    '清理临时文件',
  ];
  if (installDeps) {
    steps.push('安装项目依赖');
  }
  return steps;
}

async function runProjectCreationPipeline(config: ProjectConfig): Promise<void> {
  try {
    const templateDir = await stepCreateProjectDir(config);
    await stepCloneTemplate(templateDir, config);
    await stepCopyProjectFiles(config);
    await stepModifyProjectInfo(config);
    await stepCleanupTempFiles(config);
    if (config.installDeps) {
      await stepInstallDependencies(config);
    }
  } catch (error) {
    progress.fail('项目创建失败');
    throw error;
  }
}

async function stepCreateProjectDir(config: ProjectConfig): Promise<string> {
  progress.start('创建项目目录...');
  const templateDir = await cloneTemplate(config.projectDir);
  progress.succeed('项目目录已创建');
  return templateDir;
}

async function stepCloneTemplate(templateDir: string, config: ProjectConfig): Promise<void> {
  progress.start('克隆项目模板...');
  await copyFiles(templateDir, config);
  progress.succeed('项目模板已克隆');
}

async function stepCopyProjectFiles(config: ProjectConfig): Promise<void> {
  progress.start('复制项目文件...');
  await writeFiles(config);
  progress.succeed('项目文件已复制');
}

async function stepModifyProjectInfo(config: ProjectConfig): Promise<void> {
  progress.start('配置项目信息...');
  await modifyPackageJson(config);
  progress.succeed('项目信息已配置');
}

async function stepCleanupTempFiles(config: ProjectConfig): Promise<void> {
  progress.start('清理临时文件...');
  await cleanupFiles(config);
  progress.succeed('临时文件已清理');
}

async function stepInstallDependencies(config: ProjectConfig): Promise<void> {
  progress.start('安装项目依赖...');
  const depsInstalled = await installDependencies(config);
  if (depsInstalled) {
    progress.succeed('项目依赖已安装');
  } else {
    progress.warn('依赖安装失败');
  }
}

function printSuccessInfo(config: ProjectConfig) {
  console.log('\n✨', chalk.green('项目创建成功！'), '✨\n');
  console.log('📁', chalk.cyan('项目位置:'), config.projectDir);
  console.log('\n🚀', chalk.yellow('开始使用:'));
  console.log(chalk.dim('  cd'), config.projectName);
  if (!config.installDeps) {
    console.log(chalk.dim('  pnpm install'), chalk.gray('# 安装依赖'));
  }
  console.log(chalk.dim('  pnpm dev'), chalk.gray('# 启动开发服务器\n'));
}

function handleError(error: unknown) {
  if (error instanceof Error) {
    progress.fail(`项目创建失败: ${error.message}`);
  } else {
    progress.fail('项目创建失败: 未知错误');
  }
  process.exit(1);
}
