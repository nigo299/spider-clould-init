import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { ProjectConfig } from '../types.js';

const projectChoices = [
  { name: 'PC', value: 'pc' },
  { name: 'H5', value: 'h5' },
  { name: 'IE', value: 'ie' },
  { name: 'Mobile', value: 'mobile' },
];

export async function promptForConfig(): Promise<ProjectConfig> {
  const currentDir = process.cwd();
  let useCurrentDir = false;
  let projectName = '';
  let projectDir = '';

  // 1. 是否在当前目录创建项目
  const useCurrentDirAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useCurrentDir',
      message: '是否在当前目录创建项目？',
      default: false,
    },
  ]);
  useCurrentDir = useCurrentDirAnswer.useCurrentDir;

  // 2. 项目名与覆盖交互循环
  if (!useCurrentDir) {
    while (true) {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '请输入项目名称：',
          validate: (input) => {
            if (!/^([A-Za-z\-_\d])+$/.test(input)) {
              return '项目名称只能包含字母、数字、横线和下划线。';
            }
            return true;
          },
        },
      ]);
      projectName = name;
      projectDir = path.resolve(currentDir, projectName);
      if (fs.existsSync(projectDir)) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: '目标目录已存在，是否覆盖？',
            default: false,
          },
        ]);
        if (overwrite) break;
        // 否则继续循环重新输入项目名
      } else {
        break;
      }
    }
  } else {
    projectDir = currentDir;
    projectName = path.basename(currentDir);
  }

  // 3. 其它参数
  const restAnswers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'projectTypes',
      message: '请选择项目类型（可多选）：',
      choices: projectChoices,
      validate: (answer) => answer.length > 0 || '请至少选择一个项目类型',
    },
    {
      type: 'confirm',
      name: 'installDeps',
      message: '是否自动安装依赖？',
      default: false,
    },
  ]);

  return {
    useCurrentDir,
    projectName,
    projectTypes: restAnswers.projectTypes,
    projectDir,
    installDeps: restAnswers.installDeps,
  };
}