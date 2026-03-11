import type { ComponentDefinition } from '@/types/plugin';

/**
 * Config Builder: 生成 config.py
 */
export class ConfigBuilder {
  static generate(
    pluginName: string,
    components: ComponentDefinition[]
  ): string {
    const lines: string[] = [];

    // 检查是否有 config 类型的组件
    const hasConfig = components.some((c) => c.type === 'config');
    if (!hasConfig) {
      return '# 此插件无配置';
    }

    const configClassName = this.getConfigClassName(pluginName);

    lines.push('from src.app.plugin_system.base import (');
    lines.push('    BaseConfig, SectionBase, config_section, Field,');
    lines.push(')');
    lines.push('from pydantic import Field as PydanticField');
    lines.push('');
    lines.push('');
    lines.push(`class ${configClassName}(BaseConfig):`);
    lines.push(`    config_name = "config"`);
    lines.push('');
    lines.push('    @config_section("plugin", title="插件设置", tag="plugin", order=0)');
    lines.push('    class PluginSection(SectionBase):');
    lines.push('        enabled: bool = PydanticField(');
    lines.push('            default=True,');
    lines.push('            description="启用插件",');
    lines.push('            label="启用状态",');
    lines.push('            tag="plugin"');
    lines.push('        )');
    lines.push('');
    lines.push('    plugin: PluginSection = PydanticField(default_factory=PluginSection)');

    return lines.join('\n');
  }

  /**
   * 根据插件名生成配置类名
   */
  private static getConfigClassName(pluginName: string): string {
    const pascalName = pluginName
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    return pascalName + 'Config';
  }
}
