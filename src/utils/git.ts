import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

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
      console.error('克隆模板失败:', error);
      throw error;
    }
  }