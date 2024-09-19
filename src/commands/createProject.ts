import { ProjectConfig } from '../types.js';
import { promptForConfig } from '../utils/prompt.js';
import { cloneTemplate } from '../utils/git.js';
import { copyFiles, writeFiles, cleanupFiles } from '../utils/fileSystem.js';
import { modifyPackageJson } from '../utils/packageJson.js';
import { installDependencies } from '../utils/dependencies.js';
import { spinner } from '../utils/spinner.js';

export async function createProject() {
  try {
    const config = await promptForConfig();
    await executeProjectCreation(config);
  } catch (error) {
    handleError(error);
  }
}

async function executeProjectCreation(config: ProjectConfig) {
    try {
      spinner.start('正在创建项目...');
      const templateDir = await cloneTemplate(config.projectDir);
      
      await copyFiles(templateDir, config);
      await writeFiles(config);
      await modifyPackageJson(config);
      await cleanupFiles(config);
   
      spinner.succeed('项目创建成功！');
  
      const depsInstalled = await installDependencies(config);
      if (depsInstalled) {
        console.log('依赖安装完成');
      } else {
        console.log('跳过安装依赖');
      }
    } catch (error) {
      spinner.fail('项目创建失败');
      console.error('错误详情:', error);
      process.exit(1);
    }
  }

function handleError(error: unknown) {
  if (error instanceof Error) {
    spinner.fail(`项目创建失败: ${error.message}`);
  } else {
    spinner.fail('项目创建失败: 未知错误');
  }
  process.exit(1);
}