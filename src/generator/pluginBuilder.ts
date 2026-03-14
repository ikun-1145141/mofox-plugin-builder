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
    lines.push(`    plugin_description = "${pluginName}"`);

    // 添加配置类引用
    if (components.some((c) => c.type === 'config')) {
      const configClassName = this.getConfigClassName(pluginName);
      lines.push(`    configs = [${configClassName}]`);
    } else {
      lines.push('    configs = []');
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
      // config 组件由 ConfigBuilder 单独生成，跳过
      if (comp.type === 'config') continue;

      const className = this.getComponentClassName(comp.name, comp.type);
      classNames.push(className);

      const baseClass = this.getBaseClass(comp.type);
      lines.push('');
      lines.push(`class ${className}(${baseClass}):`);
      lines.push(`    """${comp.description || `${comp.type} 组件`}"""`);

      if (comp.type === 'action') {
        lines.push(`    action_name = "${comp.name}"`);
        lines.push(`    action_description = "${comp.description || '动作'}"`);
        if (comp.metadata?.primary) {
          lines.push('    primary_action = True');
        }
        if (comp.metadata?.chatType && comp.metadata.chatType !== 'ALL') {
          lines.push(`    chat_type = ChatType.${comp.metadata.chatType}`);
        }
        // 生成参数 schema
        if (comp.params && comp.params.length > 0) {
          lines.push('');
          this.generateSchema(lines, comp.params);
        }
        lines.push('');
        const paramSig = this.buildParamSignature(comp.params);
        lines.push(`    async def execute(self${paramSig}) -> tuple[bool, str]:`);
        lines.push(`        """${comp.description || '执行动作'}"""`);
        lines.push('        # TODO: 在这里写你的逻辑');
        lines.push('        return True, "执行成功"');
        lines.push('');
        lines.push('    async def go_activate(self) -> bool:');
        this.generateActivation(lines, comp.metadata?.activation);
      } else if (comp.type === 'tool') {
        lines.push(`    tool_name = "${comp.name}"`);
        lines.push(`    tool_description = "${comp.description || '工具'}"`);
        if (comp.metadata?.chatType && comp.metadata.chatType !== 'ALL') {
          lines.push(`    chat_type = ChatType.${comp.metadata.chatType}`);
        }
        if (comp.params && comp.params.length > 0) {
          lines.push('');
          this.generateSchema(lines, comp.params);
        }
        lines.push('');
        const toolParamSig = this.buildParamSignature(comp.params);
        lines.push(`    async def execute(self${toolParamSig}) -> tuple[bool, str]:`);
        lines.push(`        """${comp.description || '执行工具'}"""`);
        lines.push('        # TODO: 在这里写你的逻辑');
        lines.push('        return True, "执行成功"');
      } else if (comp.type === 'chatter') {
        lines.push(`    chatter_name = "${comp.name}"`);
        lines.push(`    chatter_description = "${comp.description || '对话器'}"`);
        if (comp.metadata?.chatType && comp.metadata.chatType !== 'ALL') {
          lines.push(`    chat_type = ChatType.${comp.metadata.chatType}`);
        }
        lines.push('');
        lines.push('    async def execute(self):');
        lines.push('        """对话主循环，使用 yield 返回结果"""');
        lines.push('        from src.core.components.base.chatter import Wait, Success, Failure');
        lines.push('');
        lines.push('        unreads_text, unread_msgs = await self.fetch_unreads()');
        lines.push('        if not unread_msgs:');
        lines.push('            yield Wait(time=5)');
        lines.push('            return');
        lines.push('');
        lines.push('        # 创建 LLM 请求');
        lines.push('        request = self.create_request(task="chat")');
        lines.push('        usable_map = await self.inject_usables(request)');
        lines.push('');
        lines.push('        # TODO: 调用 LLM 并处理回复');
        lines.push('        yield Success(message="回复内容")');
      } else if (comp.type === 'service') {
        lines.push(`    service_name = "${comp.name}"`);
        lines.push(`    service_description = "${comp.description || '后台服务'}"`);
        lines.push('');
        lines.push('    # TODO: 在这里定义你的服务方法');
        lines.push('    async def do_something(self):');
        lines.push('        """自定义方法"""');
        lines.push('        pass');
      } else if (comp.type === 'agent') {
        lines.push(`    agent_name = "${comp.name}"`);
        lines.push(`    agent_description = "${comp.description || '智能体'}"`);
        lines.push('');
        lines.push('    async def execute(self, **kwargs):');
        lines.push('        """执行 Agent 逻辑"""');
        lines.push('        pass');
      } else if (comp.type === 'event_handler') {
        lines.push(`    handler_name = "${comp.name}"`);
        lines.push(`    handler_description = "${comp.description || '事件处理器'}"`);
        lines.push(`    weight = ${comp.metadata?.weight ?? 0}`);
        lines.push(`    intercept_message = ${comp.metadata?.intercept ? 'True' : 'False'}`);
        lines.push(`    init_subscribe = [${comp.metadata?.eventType ? `"${comp.metadata.eventType}"` : ''}]`);
        lines.push('');
        lines.push('    async def execute(self, event_name: str, params: dict):');
        lines.push('        """处理事件"""');
        lines.push('        from src.core.components.types import EventDecision');
        lines.push('        return EventDecision.SUCCESS, params');
      } else if (comp.type === 'command') {
        lines.push(`    command_name = "${comp.name}"`);
        lines.push(`    command_description = "${comp.description || '命令'}"`);
        lines.push(`    permission_level = PermissionLevel.${comp.metadata?.permission || 'USER'}`);
        if (comp.params && comp.params.length > 0) {
          lines.push('');
          this.generateSchema(lines, comp.params);
        }
        lines.push('');
        const cmdParamSig = this.buildParamSignature(comp.params);
        lines.push(`    async def execute(self${cmdParamSig}) -> tuple[bool, str]:`);
        lines.push(`        """${comp.description || '执行命令'}"""`);
        lines.push('        # TODO: 在这里写你的逻辑');
        lines.push('        return True, "命令执行成功"');
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
  private static getComponentClassName(componentName: string, _componentType: string): string {
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

  /**
   * 生成 to_schema 方法（LLM function calling 的参数描述）
   */
  private static generateSchema(lines: string[], params: any[]): void {
    lines.push('    @classmethod');
    lines.push('    def to_schema(cls) -> dict:');
    lines.push('        return {');
    lines.push('            "type": "function",');
    lines.push('            "function": {');
    lines.push(`                "name": cls.action_name if hasattr(cls, 'action_name') else cls.tool_name,`);
    lines.push(`                "description": cls.action_description if hasattr(cls, 'action_description') else cls.tool_description,`);
    lines.push('                "parameters": {');
    lines.push('                    "type": "object",');
    lines.push('                    "properties": {');
    for (const p of params) {
      lines.push(`                        "${p.name}": {"type": "${p.type}", "description": "${p.description}"},`);
    }
    lines.push('                    },');
    const required = params.filter((p: any) => p.required).map((p: any) => `"${p.name}"`);
    lines.push(`                    "required": [${required.join(', ')}],`);
    lines.push('                },');
    lines.push('            },');
    lines.push('        }');
  }

  /**
   * 根据参数列表构建 Python 函数签名片段
   */
  private static buildParamSignature(params?: any[]): string {
    if (!params || params.length === 0) return ', **kwargs';
    const parts = params.map((p: any) => {
      const typeMap: Record<string, string> = { string: 'str', integer: 'int', number: 'float', boolean: 'bool' };
      const pyType = typeMap[p.type] || 'str';
      if (p.required) return `${p.name}: ${pyType}`;
      const defaultVal = pyType === 'str' ? 'None' : pyType === 'bool' ? 'False' : '0';
      return `${p.name}: ${pyType} | None = ${defaultVal}`;
    });
    return ', ' + parts.join(', ');
  }

  /**
   * 根据激活方式生成 go_activate 方法体
   */
  private static generateActivation(lines: string[], activation?: string): void {
    if (!activation || activation === 'always') {
      lines.push('        """始终激活"""');
      lines.push('        return True');
    } else if (activation === 'random') {
      lines.push('        """随机概率激活"""');
      lines.push('        return self._random_activation(0.5)');
    } else if (activation === 'keyword') {
      lines.push('        """关键词匹配激活"""');
      lines.push('        return self._keyword_match(["关键词1", "关键词2"])');
    } else if (activation === 'llm_judge') {
      lines.push('        """由 AI 判断是否激活"""');
      lines.push('        return await self._llm_judge_activation(');
      lines.push('            judge_prompt="判断是否需要执行此动作",');
      lines.push('            action_require="当用户需要时返回 True",');
      lines.push('        )');
    }
  }
}
