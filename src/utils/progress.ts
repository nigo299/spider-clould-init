import ora from 'ora';
import chalk from 'chalk';

export class ProgressManager {
  private spinner: ora.Ora;
  private steps: string[];
  private currentStep: number;
  private totalSteps: number;

  constructor() {
    this.spinner = ora({
      spinner: 'dots',
      color: 'cyan',
    });
    this.steps = [];
    this.currentStep = 0;
    this.totalSteps = 0;
  }

  /**
   * 初始化进度步骤
   * @param steps 步骤列表
   */
  initSteps(steps: string[]) {
    this.steps = steps;
    this.totalSteps = steps.length;
    this.currentStep = 0;
  }

  private getProgressBar(): string {
    const width = 30;
    const completed = Math.floor((this.currentStep / this.totalSteps) * width);
    const remaining = width - completed;
    
    return chalk.cyan('┃') + 
           chalk.bgCyan(' '.repeat(completed)) +
           chalk.bgGray(' '.repeat(remaining)) +
           chalk.cyan('┃');
  }

  private getStepCount(): string {
    return chalk.cyan(`[${this.currentStep}/${this.totalSteps}]`);
  }

  /**
   * 开始一个新步骤
   * @param message 步骤描述
   */
  start(message: string) {
    this.currentStep++;
    this.spinner.start();
    this.spinner.text = `${this.getStepCount()} ${this.getProgressBar()} ${message}`;
  }

  /**
   * 标记当前步骤成功
   * @param message 成功信息
   */
  succeed(message?: string) {
    const prefix = chalk.green(`${this.getStepCount()} ${this.getProgressBar()}`);
    this.spinner.succeed(message ? `${prefix} ${message}` : undefined);
  }

  /**
   * 标记当前步骤失败
   * @param message 失败信息
   */
  fail(message?: string) {
    const prefix = chalk.red(`${this.getStepCount()} ${this.getProgressBar()}`);
    this.spinner.fail(message ? `${prefix} ${message}` : undefined);
  }

  /**
   * 显示警告信息
   * @param message 警告信息
   */
  warn(message: string) {
    this.currentStep++;
    const prefix = chalk.yellow(`${this.getStepCount()} ${this.getProgressBar()}`);
    this.spinner.warn(`${prefix} ${message}`);
  }

  /**
   * 显示信息
   * @param message 信息内容
   */
  info(message: string) {
    const prefix = chalk.blue(`${this.getStepCount()} ${this.getProgressBar()}`);
    this.spinner.info(`${prefix} ${message}`);
  }

  /**
   * 更新当前步骤的消息
   * @param message 新消息
   */
  update(message: string) {
    const prefix = chalk.cyan(`${this.getStepCount()} ${this.getProgressBar()}`);
    this.spinner.text = `${prefix} ${message}`;
  }

  /**
   * 停止进度显示
   */
  stop() {
    this.spinner.stop();
  }

  /**
   * 清除当前行
   */
  clear() {
    this.spinner.clear();
  }
}
