import { defineStore } from 'pinia';
import type { ComponentDefinition, PluginManifest, GeneratedPluginFiles } from '@/types/plugin';

export const usePluginProjectStore = defineStore('plugin-project', {
  state: () => ({
    // 项目基础信息
    blocks: null as any,
    pluginName: '',
    pluginVersion: '1.0.0',
    pluginDescription: '',

    // 生成的代码文件
    generatedManifest: {} as PluginManifest,
    generatedPluginPy: '',
    generatedConfigPy: '',
    components: [] as ComponentDefinition[],

    // 构建状态
    buildStatus: 'idle' as 'idle' | 'generating' | 'ready' | 'error',

    // Git 同步状态
    gitRepo: '' as string,                  // GitHub 仓库 URL
    gitToken: '' as string,                 // 存于 IndexedDB，不入 localStorage
    gitSyncStatus: 'idle' as 'idle' | 'syncing' | 'synced' | 'error',
    gitLastCommit: null as string | null,   // 最近一次 commit hash
    gitAutoSync: false,                     // 是否开启自动同步
    gitUserName: 'MoFox User',
    gitUserEmail: 'user@mofox.local',
  }),

  getters: {
    isGenerationReady(): boolean {
      return this.pluginName.length > 0 && this.components.length > 0;
    },

    isGitConnected(): boolean {
      return this.gitRepo.length > 0 && this.gitToken.length > 0;
    },

    generatedFiles(): GeneratedPluginFiles {
      return {
        manifest: this.generatedManifest,
        plugin_py: this.generatedPluginPy,
        config_py: this.generatedConfigPy,
      };
    },

    gitSyncStatusDisplay(): string {
      const statusMap: Record<string, string> = {
        idle: '就绪',
        syncing: '正在同步...',
        synced: '已同步 ✓',
        error: '同步失败',
      };
      return statusMap[this.gitSyncStatus] || '未知';
    },
  },

  actions: {
    // 设置项目基础信息
    setProjectInfo(name: string, version: string, description: string) {
      this.pluginName = name;
      this.pluginVersion = version;
      this.pluginDescription = description;
    },

    // 添加组件
    addComponent(component: ComponentDefinition) {
      this.components.push(component);
    },

    // 移除组件
    removeComponent(index: number) {
      this.components.splice(index, 1);
    },

    // 更新组件
    updateComponent(index: number, component: ComponentDefinition) {
      this.components[index] = component;
    },

    // 清空组件
    clearComponents() {
      this.components = [];
    },

    // 生成代码（调用代码生成器）
    async generateCode() {
      this.buildStatus = 'generating';
      try {
        // TODO: 调用 manifestBuilder.generate() 等
        this.buildStatus = 'ready';
      } catch (error) {
        this.buildStatus = 'error';
        throw error;
      }
    },

    // Git 同步：一键推送到 GitHub
    async syncToGitHub(_message?: string) {
      this.gitSyncStatus = 'syncing';
      try {
        // TODO: 调用 gitSyncService.syncToGitHub()
        this.gitSyncStatus = 'synced';
      } catch (error) {
        this.gitSyncStatus = 'error';
        throw error;
      }
    },

    // 连接 GitHub 仓库
    async connectGitHub(repoUrl: string, token: string, userName?: string, email?: string) {
      this.gitRepo = repoUrl;
      this.gitToken = token;
      if (userName) this.gitUserName = userName;
      if (email) this.gitUserEmail = email;
      // TODO: 调用 gitSyncService.init()
    },

    // 断开 GitHub 连接（清除 token）
    disconnectGitHub() {
      this.gitRepo = '';
      this.gitToken = '';
      this.gitLastCommit = null;
      this.gitSyncStatus = 'idle';
    },

    // 启用/关闭自动同步
    toggleAutoSync(enabled: boolean) {
      this.gitAutoSync = enabled;
    },

    // 导出源码（AGPL 合规）
    exportSourceBundle() {
      // TODO: 实现源码导出
      return new Blob([]);
    },

    // 重置项目
    reset() {
      this.pluginName = '';
      this.pluginVersion = '1.0.0';
      this.pluginDescription = '';
      this.components = [];
      this.generatedManifest = {} as PluginManifest;
      this.generatedPluginPy = '';
      this.generatedConfigPy = '';
      this.buildStatus = 'idle';
    },
  },
});
