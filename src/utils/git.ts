import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

const GITLAB_URL = process.env.GITLAB_URL || 'http://gitlab.cqlvc.com';
const TEMPLATE_REPO = process.env.TEMPLATE_REPO || '/spider-design/spider-cloud-template.git';

export async function cloneTemplate(projectDir: string): Promise<string> {
    const git = simpleGit();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spider-cloud-template-'));

    try {
      await git.clone(`${GITLAB_URL}${TEMPLATE_REPO}`, tempDir);
      fs.removeSync(path.join(tempDir, '.git'));
      return tempDir;
    } catch (error) {
      // 清理临时目录
      if (fs.existsSync(tempDir)) {
        fs.removeSync(tempDir);
      }

      // 处理具体的错误类型
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('authentication failed') ||
            errorMessage.includes('permission denied') ||
            errorMessage.includes('could not read from remote repository')) {
          console.error(chalk.red('\n克隆模板失败: 权限验证失败'));
          console.error(chalk.yellow('\n可能的原因:'));
          console.error(chalk.yellow('1. 您没有访问模板仓库的权限'));
          console.error(chalk.yellow('2. 您的 Git 凭证配置有误'));
          console.error(chalk.yellow('\n解决方案:'));
          console.error(chalk.yellow('1. 请确认您已经被添加到项目成员中'));
          console.error(chalk.yellow('2. 检查您的 Git 配置是否正确'));
          console.error(chalk.yellow(`3. 联系管理员获取 ${GITLAB_URL}${TEMPLATE_REPO} 的访问权限`));
        } else {
          console.error(chalk.red('\n克隆模板失败:'), error.message);
        }
      } else {
        console.error(chalk.red('\n克隆模板失败: 未知错误'));
      }

      throw new Error('模板克隆失败，请查看上述错误信息');
    }
  }
