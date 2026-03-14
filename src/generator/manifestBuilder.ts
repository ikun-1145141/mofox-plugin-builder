import type { PluginManifest, ComponentDefinition } from '@/types/plugin';

/**
 * Manifest Builder: 根据组件列表生成 manifest.json
 */
export class ManifestBuilder {
  static generate(
    pluginName: string,
    pluginVersion: string,
    components: ComponentDefinition[]
  ): PluginManifest {
    const manifest: PluginManifest = {
      name: pluginName,
      version: pluginVersion,
      entry_point: 'plugin.py',
      min_core_version: '1.0.0',
      include: this.generateComponentDeclarations(components),
    };

    // 如果有依赖，添加 dependencies 字段
    const deps = this.extractDependencies(components);
    if (deps.plugins?.length || deps.components?.length) {
      manifest.dependencies = deps;
    }

    return manifest;
  }

  /**
   * 根据组件列表生成 include 数组
   */
  private static generateComponentDeclarations(
    components: ComponentDefinition[]
  ) {
    return components
      .filter((comp) => comp.type !== 'config')
      .map((comp) => ({
        component_type: comp.type,
        component_name: comp.name,
        enabled: true,
        dependencies: comp.dependencies || [],
      }));
  }

  /**
   * 从组件中提取依赖
   */
  private static extractDependencies(components: ComponentDefinition[]) {
    const dependencies = {
      plugins: new Set<string>(),
      components: new Set<string>(),
    };

    for (const comp of components) {
      if (comp.dependencies && Array.isArray(comp.dependencies)) {
        for (const dep of comp.dependencies) {
          // 假设依赖格式为 "plugin_name:component_type:component_name"
          if (dep.includes(':')) {
            dependencies.components.add(dep);
          } else {
            dependencies.plugins.add(dep);
          }
        }
      }
    }

    return {
      plugins: dependencies.plugins.size > 0 ? Array.from(dependencies.plugins) : undefined,
      components: dependencies.components.size > 0 ? Array.from(dependencies.components) : undefined,
    };
  }
}
