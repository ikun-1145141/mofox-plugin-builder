import type { ComponentDefinition } from '@/types/plugin';
import type { SettingInfo } from '@/blocks';

/**
 * Config Builder: 生成 config.py
 */
export class ConfigBuilder {
  static generate(
    pluginName: string,
    components: ComponentDefinition[],
    settings?: SettingInfo[]
  ): string {
    const lines: string[] = [];

    // 旧逻辑：检查是否有 config 类型组件；新逻辑：也看有没有 settings
    const hasConfig = components.some((c) => c.type === 'config');
    const hasSettings = settings && settings.length > 0;
    if (!hasConfig && !hasSettings) {
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

    // 如果有从积木解析的设置项，生成 PluginSection
    if (hasSettings) {
      lines.push('    @config_section("plugin", title="插件设置", tag="plugin", order=0)');
      lines.push('    class PluginSection(SectionBase):');
      for (const s of settings!) {
        const pyType = s.type === 'bool' ? 'bool' : s.type === 'int' ? 'int' : s.type === 'float' ? 'float' : 'str';
        let defaultExpr: string;
        if (pyType === 'bool') {
          defaultExpr = s.default_value === 'True' || s.default_value === 'true' ? 'True' : 'False';
        } else if (pyType === 'int' || pyType === 'float') {
          defaultExpr = s.default_value || '0';
        } else {
          defaultExpr = `"${s.default_value}"`;
        }
        lines.push(`        ${s.name}: ${pyType} = PydanticField(`);
        lines.push(`            default=${defaultExpr},`);
        lines.push(`            description="${s.description}",`);
        lines.push(`        )`);
      }
      lines.push('');
      lines.push('    plugin: PluginSection = PydanticField(default_factory=PluginSection)');
    } else {
      // 旧逻辑回退
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
    }

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
