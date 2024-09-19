#!/usr/bin/env node

import { program } from 'commander';
import { createProject } from './commands/createProject.js';
import { version } from '../package.json';

program
  .version(version)
  .description('Spider Cloud 项目初始化工具')
  .command('create')
  .description('创建一个新的 Spider Cloud 项目')
  .action(createProject);

program.parse(process.argv);