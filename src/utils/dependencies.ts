import { execSync } from 'child_process';
import { ProjectConfig } from '../types.js';
import chalk from 'chalk';
import which from 'which';

function detectPackageManager(): 'pnpm' | 'yarn' | 'npm' {
  if (which.sync('pnpm', { nothrow: true })) return 'pnpm';
  if (which.sync('yarn', { nothrow: true })) return 'yarn';
  return 'npm';
}

export async function installDependencies(config: ProjectConfig, pm?: string): Promise<boolean> {
  if (!config.installDeps) {
    console.log(chalk.yellow('\n您选择了不安装依赖。'));
    return false;
  }
  let packageManager = pm || detectPackageManager();
  try {
    console.log(chalk.cyan(`\n正在使用 ${packageManager} 安装依赖...`));
    execSync(`${packageManager} install`, { cwd: config.projectDir, stdio: 'inherit', timeout: 5 * 60 * 1000 });
    console.log(chalk.green(`\n依赖安装完成！（使用 ${packageManager}）`));
    return true;
  } catch (error) {
    console.error(chalk.red('\n依赖安装失败，请检查网络、权限或包管理器。'));
    return false;
  }
}