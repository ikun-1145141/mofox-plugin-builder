import type { GitAuthInfo } from '@/types/plugin';

const GITHUB_OAUTH_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'YOUR_CLIENT_ID';
const GITHUB_OAUTH_REDIRECT_URI = `${window.location.origin}/auth/callback`;

/**
 * GitHub 认证管理器
 */
export class GitHubAuthManager {
  private readonly STORAGE_KEY = 'mofox_git_auth';

  /**
   * 存储 auth 信息到 IndexedDB（加密）
   */
  async saveAuthInfo(authInfo: GitAuthInfo): Promise<void> {
    try {
      const encrypted = await this.encryptAuthInfo(authInfo);
      localStorage.setItem(this.STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to save auth info:', error);
      throw error;
    }
  }

  /**
   * 从 IndexedDB 读取 auth 信息（解密）
   */
  async getAuthInfo(): Promise<GitAuthInfo | null> {
    try {
      const encrypted = localStorage.getItem(this.STORAGE_KEY);
      if (!encrypted) {
        return null;
      }

      return await this.decryptAuthInfo(encrypted);
    } catch (error) {
      console.error('Failed to get auth info:', error);
      return null;
    }
  }

  /**
   * 清除 auth 信息
   */
  async clearAuthInfo(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * 检查 token 是否过期
   */
  isTokenExpired(authInfo: GitAuthInfo): boolean {
    if (!authInfo.expires_at) {
      return false;
    }

    return authInfo.expires_at < Date.now();
  }

  /**
   * 生成 OAuth 授权 URL
   */
  getOAuthAuthorizationUrl(): string {
    const scope = 'repo'; // 仅请求 repo 权限（最小权限原则）
    const state = this.generateRandomState();

    // 存储 state 用于验证
    sessionStorage.setItem('oauth_state', state);

    return `https://github.com/login/oauth/authorize?` +
      `client_id=${GITHUB_OAUTH_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(GITHUB_OAUTH_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`;
  }

  /**
   * 处理 OAuth 回调
   */
  async handleOAuthCallback(code: string, state: string): Promise<GitAuthInfo> {
    // 验证 state
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid OAuth state');
    }

    sessionStorage.removeItem('oauth_state');

    // 使用 code 交换 token（需要后端支持）
    // 这里假设我们有一个后端 endpoint 处理 OAuth 交换
    const response = await fetch('/api/v1/auth/github/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange OAuth code');
    }

    const authInfo: GitAuthInfo = await response.json();

    // 保存 auth 信息
    await this.saveAuthInfo(authInfo);

    return authInfo;
  }

  /**
   * 验证 PAT token 是否有效
   */
  async validatePAT(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to validate PAT:', error);
      return false;
    }
  }

  /**
   * 获取当前登录用户信息
   */
  async getUserInfo(token: string) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  /**
   * 简单的加密（实际应用中应该使用 TweetNaCl.js 或类似库）
   */
  private async encryptAuthInfo(authInfo: GitAuthInfo): Promise<string> {
    // TODO: 使用真正的加密库
    return btoa(JSON.stringify(authInfo));
  }

  /**
   * 解密 auth 信息
   */
  private async decryptAuthInfo(encrypted: string): Promise<GitAuthInfo> {
    // TODO: 使用真正的加密库
    return JSON.parse(atob(encrypted));
  }

  /**
   * 生成随机 state 用于 OAuth 验证
   */
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
}

// 导出单例
export const gitHubAuthManager = new GitHubAuthManager();
