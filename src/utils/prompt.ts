import inquirer from 'inquirer';
import path from 'path';
import { ProjectConfig } from '../types.js';

const projectChoices = [
  { name: 'PC', value: 'pc' },
  { name: 'H5', value: 'h5' },
  { name: 'IE', value: 'ie' },
  { name: 'Mobile', value: 'mobile' },
];

export async function promptForConfig(): Promise<ProjectConfig> {
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
    {
      type: 'confirm',
      name: 'installDeps',
      message: '是否自动安装依赖？',
      default: false,
    }
  ]);

  const { useCurrentDir, projectName, projectTypes, installDeps } = answers;
  const currentDir = process.cwd();
  const projectDir = useCurrentDir ? currentDir : path.resolve(currentDir, projectName);

  return {
    useCurrentDir,
    projectName: useCurrentDir ? path.basename(currentDir) : projectName,
    projectTypes,
    projectDir,
    installDeps,
  };
}