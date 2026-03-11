import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import FS from '@isomorphic-git/lightning-fs';

/**
 * Git 同步服务：封装 isomorphic-git 的所有操作
 */
export class GitSyncService {
  private fs: FS;
  private dir: string = '/plugin-repo';
  private token: string = '';
  private userName: string = 'MoFox User';
  private userEmail: string = 'user@mofox.local';

  constructor() {
    this.fs = new FS('git-fs');
  }

  /**
   * 初始化：克隆或初始化仓库
   */
  async init(repoUrl: string, token: string, userName?: string, email?: string): Promise<void> {
    this.token = token;
    if (userName) this.userName = userName;
    if (email) this.userEmail = email;

    try {
      // 检查是否已存在仓库
      const files = await this.fs.promises.readdir(this.dir).catch(() => null);
      if (files && files.length > 0) {
        console.log('Repository already exists');
        return;
      }

      // 克隆仓库
      await git.clone({
        fs: this.fs,
        http,
        dir: this.dir,
        url: repoUrl,
        onAuth: () => ({
          username: 'oauth2',
          password: this.token,
        }),
      });

      console.log('Repository cloned successfully');
    } catch (error) {
      console.error('Failed to init repository:', error);
      throw error;
    }
  }

  /**
   * 一键同步：将生成的插件文件 commit & push 到 GitHub
   */
  async syncToGitHub(pluginFiles: Record<string, string>, message?: string): Promise<string> {
    try {
      // 1. 写入文件到虚拟 FS
      for (const [path, content] of Object.entries(pluginFiles)) {
        const filePath = `${this.dir}/${path}`;
        const dir = filePath.substring(0, filePath.lastIndexOf('/'));

        // 创建目录
        await this.fs.promises.mkdir(dir, { recursive: true }).catch(() => {});

        // 写入文件
        await this.fs.promises.writeFile(filePath, content);

        // 添加到 git
        await git.add({
          fs: this.fs,
          dir: this.dir,
          filepath: path,
        });
      }

      // 2. 生成 commit message
      const commitMsg =
        message || this.generateCommitMessage(Object.keys(pluginFiles));

      // 3. Commit
      const commitHash = await git.commit({
        fs: this.fs,
        dir: this.dir,
        message: commitMsg,
        author: {
          name: this.userName,
          email: this.userEmail,
        },
      });

      // 4. Push 到远程
      await git.push({
        fs: this.fs,
        http,
        dir: this.dir,
        onAuth: () => ({
          username: 'oauth2',
          password: this.token,
        }),
      });

      console.log(`Successfully pushed commit: ${commitHash}`);
      return commitHash;
    } catch (error) {
      console.error('Failed to sync to GitHub:', error);
      throw error;
    }
  }

  /**
   * 获取最新的 commit hash
   */
  async getLatestCommitHash(): Promise<string> {
    try {
      const commits = await git.log({
        fs: this.fs,
        dir: this.dir,
      });

      if (commits.length > 0) {
        return commits[0].oid;
      }

      return '';
    } catch (error) {
      console.error('Failed to get latest commit hash:', error);
      return '';
    }
  }

  /**
   * 获取 commit 历史
   */
  async getCommitHistory(depth: number = 10): Promise<any[]> {
    try {
      const commits = await git.log({
        fs: this.fs,
        dir: this.dir,
        depth,
      });

      return commits;
    } catch (error) {
      console.error('Failed to get commit history:', error);
      return [];
    }
  }

  /**
   * 获取仓库状态
   */
  async getStatus(): Promise<string[]> {
    try {
      const status = await git.statusMatrix({
        fs: this.fs,
        dir: this.dir,
      });

      return status.map((item) => item[0]);
    } catch (error) {
      console.error('Failed to get repository status:', error);
      return [];
    }
  }

  /**
   * 智能生成 commit message
   */
  private generateCommitMessage(changedFiles: string[]): string {
    const fileTypes = new Set<string>();

    for (const file of changedFiles) {
      if (file.includes('manifest.json')) fileTypes.add('manifest');
      if (file.includes('plugin.py')) fileTypes.add('plugin');
      if (file.includes('config.py')) fileTypes.add('config');
    }

    if (fileTypes.size === 0) {
      return 'chore: update plugin';
    }

    const typeList = Array.from(fileTypes).join(', ');
    return `chore(plugin): update ${typeList}`;
  }

  /**
   * 清理本地文件系统
   */
  async cleanup(): Promise<void> {
    try {
      await this.fs.promises.rm(this.dir, { recursive: true });
      console.log('Repository cleaned up');
    } catch (error) {
      console.error('Failed to cleanup:', error);
    }
  }
}

// 导出单例
export const gitSyncService = new GitSyncService();
