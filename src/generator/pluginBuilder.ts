import type { ComponentDefinition } from '@/types/plugin';

/**
 * Plugin Builder: 根据组件列表生成 plugin.py
 */
export class PluginBuilder {
  static generate(
    pluginName: string,
    components: ComponentDefinition[]
  ): string {
    const lines: string[] = [];

    // 生成导入语句
    lines.push('from src.app.plugin_system.base import (');
    lines.push('    BasePlugin, register_plugin, Field,');
    lines.push('    BaseAction, BaseTool, BaseAgent, BaseChatter,');
    lines.push('    BaseService, BaseEventHandler, BaseAdapter,');
    lines.push('    BaseCommand, BaseRouter, BaseConfig,');
    lines.push(')');
    lines.push('from src.core.components.types import ChatType, PermissionLevel');
    lines.push('');

    // 如果有配置组件，导入 config
    if (components.some((c) => c.type === 'config')) {
      lines.push('from .config import ' + this.getConfigClassName(pluginName));
      lines.push('');
    }

    // 生成每个组件的类定义（简化版，仅生成骨架）
    const componentClassNames = this.generateComponentClasses(lines, components);

    lines.push('');
    lines.push('@register_plugin');
    lines.push(`class ${this.getPluginClassName(pluginName)}(BasePlugin):`);
    lines.push(`    plugin_name = "${pluginName}"`);
    lines.push('    configs = []');

    // 添加配置类引用
    if (components.some((c) => c.type === 'config')) {
      const configClassName = this.getConfigClassName(pluginName);
      lines.push(`    configs = [${configClassName}]`);
    }

    lines.push('');
    lines.push('    async def on_plugin_loaded(self):');
    lines.push('        """插件加载时调用"""');
    lines.push('        pass');
    lines.push('');
    lines.push('    async def on_plugin_unloaded(self):');
    lines.push('        """插件卸载时调用"""');
    lines.push('        pass');
    lines.push('');
    lines.push('    def get_components(self):');
    lines.push('        """返回插件包含的所有组件类"""');
    lines.push(`        return [${componentClassNames.join(', ')}]`);

    return lines.join('\n');
  }

  /**
   * 生成组件类的骨架
   */
  private static generateComponentClasses(lines: string[], components: ComponentDefinition[]): string[] {
    const classNames: string[] = [];

    for (const comp of components) {
      const className = this.getComponentClassName(comp.name, comp.type);
      classNames.push(className);

      const baseClass = this.getBaseClass(comp.type);
      lines.push('');
      lines.push(`class ${className}(${baseClass}):`);
      lines.push(`    """${comp.description || `${comp.type} 组件`}"""`);

      if (comp.type === 'action') {
        lines.push(`    component_name = "${comp.name}"`);
        lines.push('');
        lines.push('    async def execute(self, **kwargs):');
        lines.push('        """执行 Action"""');
        lines.push('        pass');
        lines.push('');
        lines.push('    async def go_activate(self):');
        lines.push('        """激活 Action"""');
        lines.push('        pass');
      } else if (comp.type === 'tool') {
        lines.push(`    component_name = "${comp.name}"`);
        lines.push('');
        lines.push('    async def execute(self, **kwargs):');
        lines.push('        """执行 Tool"""');
        lines.push('        pass');
      } else if (comp.type === 'chatter') {
        lines.push(`    component_name = "${comp.name}"`);
        lines.push('');
        lines.push('    async def execute(self, unreads):');
        lines.push('        """Chatter 主逻辑"""');
        lines.push('        yield None  # AsyncGenerator');
      } else if (comp.type === 'service') {
        lines.push(`    component_name = "${comp.name}"`);
        lines.push('');
        lines.push('    async def some_method(self):');
        lines.push('        """自定义方法"""');
        lines.push('        pass');
      } else if (comp.type === 'agent') {
        lines.push(`    component_name = "${comp.name}"`);
        lines.push(`    agent_description = "${comp.description || '代理组件'}"`);
        lines.push('');
        lines.push('    async def execute(self, **kwargs):');
        lines.push('        """执行 Agent 逻辑"""');
        lines.push('        pass');
      } else if (comp.type === 'event_handler') {
        lines.push(`    handler_name = "${comp.name}"`);
        lines.push(`    handler_description = "${comp.description || '事件处理器'}"`);
        lines.push('    weight = 0');
        lines.push('    intercept_message = False');
        lines.push(`    init_subscribe = [${comp.metadata?.eventType ? `"${comp.metadata.eventType}"` : ''}]`);
        lines.push('');
        lines.push('    async def execute(self, event_name: str, params: dict):');
        lines.push('        """处理事件"""');
        lines.push('        from src.core.components.types import EventDecision');
        lines.push('        return EventDecision.SUCCESS, params');
      } else if (comp.type === 'command') {
        lines.push(`    command_name = "${comp.name}"`);
        lines.push(`    command_description = "${comp.description || '命令组件'}"`);
        lines.push(`    permission_level = PermissionLevel.${comp.metadata?.permission || 'USER'}`);
        lines.push('');
        lines.push('    async def execute(self, **kwargs):');
        lines.push('        """执行命令"""');
        lines.push('        pass');
      } else if (comp.type === 'adapter') {
        lines.push(`    adapter_name = "${comp.name}"`);
        lines.push(`    adapter_description = "${comp.description || '适配器'}"`);
        lines.push('');
        lines.push('    async def connect(self):');
        lines.push('        """建立连接"""');
        lines.push('        pass');
        lines.push('');
        lines.push('    async def disconnect(self):');
        lines.push('        """断开连接"""');
        lines.push('        pass');
      } else if (comp.type === 'router') {
        lines.push(`    router_name = "${comp.name}"`);
        lines.push(`    router_description = "${comp.description || 'HTTP 路由'}"`);
        lines.push('');
        lines.push('    def register_routes(self, app):');
        lines.push('        """注册 HTTP 路由"""');
        lines.push('        pass');
      } else {
        // 其他类型的通用骨架
        lines.push(`    component_name = "${comp.name}"`);
      }
    }

    return classNames;
  }

  /**
   * 获取组件对应的基类
   */
  private static getBaseClass(componentType: string): string {
    const baseClasses: Record<string, string> = {
      action: 'BaseAction',
      tool: 'BaseTool',
      agent: 'BaseAgent',
      chatter: 'BaseChatter',
      service: 'BaseService',
      event_handler: 'BaseEventHandler',
      adapter: 'BaseAdapter',
      command: 'BaseCommand',
      router: 'BaseRouter',
      config: 'BaseConfig',
    };
    return baseClasses[componentType] || 'BaseComponent';
  }

  /**
   * 根据组件名生成类名（snake_case → PascalCase）
   */
  private static getComponentClassName(componentName: string, componentType: string): string {
    const pascalName = componentName
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    return pascalName;
  }

  /**
   * 根据插件名生成插件类名
   */
  private static getPluginClassName(pluginName: string): string {
    const pascalName = pluginName
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    return pascalName + 'Plugin';
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
