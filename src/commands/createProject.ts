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
    // 先收集配置
    const config = await promptForConfig();

    // 根据是否安装依赖确定步骤
    const steps = [
      '创建项目目录',
      '克隆项目模板',
      '复制项目文件',
      '配置项目信息',
      '清理临时文件',
    ];

    if (config.installDeps) {
      steps.push('安装项目依赖');
    }

    // 初始化进度条并开始创建
    progress.initSteps(steps);
    await executeProjectCreation(config);

    // 显示成功信息和后续步骤
    console.log('\n✨', chalk.green('项目创建成功！'), '✨\n');
    console.log('📁', chalk.cyan('项目位置:'), config.projectDir);
    console.log('\n🚀', chalk.yellow('开始使用:'));
    console.log(chalk.dim('  cd'), config.projectName);

    if (!config.installDeps) {
      console.log(chalk.dim('  pnpm install'), chalk.gray('# 安装依赖'));
    }

    console.log(chalk.dim('  pnpm dev'), chalk.gray('# 启动开发服务器\n'));
  } catch (error) {
    handleError(error);
  }
}

async function executeProjectCreation(config: ProjectConfig): Promise<void> {
  try {
    // 步骤 1: 创建项目目录
    progress.start('创建项目目录...');
    const templateDir = await cloneTemplate(config.projectDir);
    progress.succeed('项目目录已创建');

    // 步骤 2: 克隆项目模板
    progress.start('克隆项目模板...');
    await copyFiles(templateDir, config);
    progress.succeed('项目模板已克隆');

    // 步骤 3: 复制项目文件
    progress.start('复制项目文件...');
    await writeFiles(config);
    progress.succeed('项目文件已复制');

    // 步骤 4: 配置项目信息
    progress.start('配置项目信息...');
    await modifyPackageJson(config);
    progress.succeed('项目信息已配置');

    // 步骤 5: 清理临时文件
    progress.start('清理临时文件...');
    await cleanupFiles(config);
    progress.succeed('临时文件已清理');

    // 步骤 6: 安装项目依赖（如果用户选择了安装）
    if (config.installDeps) {
      progress.start('安装项目依赖...');
      const depsInstalled = await installDependencies(config);
      if (depsInstalled) {
        progress.succeed('项目依赖已安装');
      } else {
        progress.warn('依赖安装失败');
      }
    }
  } catch (error) {
    progress.fail('项目创建失败');
    throw error;
  }
}

function handleError(error: unknown) {
  if (error instanceof Error) {
    progress.fail(`项目创建失败: ${error.message}`);
  } else {
    progress.fail('项目创建失败: 未知错误');
  }
  process.exit(1);
}
