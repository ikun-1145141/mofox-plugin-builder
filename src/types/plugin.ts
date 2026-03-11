// Neo-MoFox 插件相关类型定义

export interface ComponentDefinition {
  type: 'action' | 'tool' | 'agent' | 'chatter' | 'service' | 'event_handler' | 'adapter' | 'command' | 'router' | 'config';
  name: string;
  description?: string;
  [key: string]: any;
}

export interface PluginManifest {
  name: string;
  version: string;
  entry_point: string;
  min_core_version: string;
  dependencies?: {
    plugins?: string[];
    components?: string[];
  };
  include: Array<{
    component_type: string;
    component_name: string;
    dependencies?: string[];
    enabled: boolean;
  }>;
}

export interface GeneratedPluginFiles {
  manifest: PluginManifest;
  plugin_py: string;
  config_py?: string;
}

export interface GitAuthInfo {
  token: string;
  username?: string;
  email?: string;
  expires_at?: number;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'synced' | 'error';
  message?: string;
  lastCommit?: string;
  timestamp?: number;
}
