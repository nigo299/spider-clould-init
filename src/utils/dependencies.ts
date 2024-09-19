import { execSync } from 'child_process';
import { ProjectConfig } from '../types.js';
import chalk from 'chalk';
import inquirer from 'inquirer';

export async function installDependencies(config: ProjectConfig): Promise<boolean> {
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
    if (error instanceof Error && error.message.includes('User force closed the prompt')) {
      console.log(chalk.yellow('\n退出'));
      return false;
    } else {
      throw error;
    }
  }

  if (installDeps) {
    console.log(chalk.blue('\n正在安装依赖...'));
    execSync('pnpm install', { cwd: config.projectDir, stdio: 'inherit' });
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
  config.projectTypes.forEach((type) => {
    console.log(chalk.yellow(`     pnpm start:${type}`));
  });

  return installDeps;
}