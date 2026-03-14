import * as Blockly from 'blockly';
import type { ComponentDefinition } from '@/types/plugin';

/**
 * MoFox 插件积木定义
 *
 * 根据 Neo-MoFox 的真实插件结构（default_chatter / booku_memory / napcat_adapter）设计，
 * 确保积木拼出来的插件能直接跑。
 *
 * 结构：「我的插件」容器 → 组件积木 → 参数积木
 */

// ========================================
// 1. 插件主体
// ========================================
Blockly.Blocks['plugin_main'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[插件]')
      .appendField(new Blockly.FieldTextInput('my_plugin'), 'NAME');
    this.appendDummyInput()
      .appendField('  版本')
      .appendField(new Blockly.FieldTextInput('1.0.0'), 'VERSION');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput(''), 'DESC');
    this.appendStatementInput('COMPONENTS')
      .appendField('包含的功能');
    this.setColour(270);
    this.setDeletable(false);
    this.setTooltip('插件的总入口，把功能积木拖到里面');
  },
};

// ========================================
// 2. 组件积木 —— 基于真实插件的组件类型
// ========================================

// Action: LLM 可调用的动作（参考 SendTextAction / StopConversationAction）
Blockly.Blocks['comp_action'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[动作]')
      .appendField(new Blockly.FieldTextInput('send_text'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('发送一条文本消息'), 'DESC');
    this.appendDummyInput()
      .appendField('  触发方式')
      .appendField(new Blockly.FieldDropdown([
        ['由 AI 自动决定', 'llm_judge'],
        ['关键词匹配', 'keyword'],
        ['随机概率', 'random'],
        ['始终触发', 'always'],
      ]), 'ACTIVATION');
    this.appendDummyInput()
      .appendField('  适用场景')
      .appendField(new Blockly.FieldDropdown([
        ['私聊和群聊', 'ALL'],
        ['仅私聊', 'PRIVATE'],
        ['仅群聊', 'GROUP'],
      ]), 'CHAT_TYPE');
    this.appendDummyInput()
      .appendField('  是否为主要动作')
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'PRIMARY');
    this.appendStatementInput('PARAMS')
      .appendField('  参数列表');
    this.setColour(208);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('LLM 可以调用的动作，对应 BaseAction。比如发送消息、停止对话');
  },
};

// Tool: LLM 可调用的查询工具（参考 booku_memory 的各个 Tool）
Blockly.Blocks['comp_tool'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[工具]')
      .appendField(new Blockly.FieldTextInput('search_web'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('搜索网页内容'), 'DESC');
    this.appendDummyInput()
      .appendField('  适用场景')
      .appendField(new Blockly.FieldDropdown([
        ['私聊和群聊', 'ALL'],
        ['仅私聊', 'PRIVATE'],
        ['仅群聊', 'GROUP'],
      ]), 'CHAT_TYPE');
    this.appendStatementInput('PARAMS')
      .appendField('  参数列表');
    this.setColour(160);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('LLM 可以调用的工具，对应 BaseTool。用于查询信息并返回给 AI');
  },
};

// Chatter: 对话主循环（参考 DefaultChatter）
Blockly.Blocks['comp_chatter'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[对话器]')
      .appendField(new Blockly.FieldTextInput('my_chatter'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('处理对话主循环'), 'DESC');
    this.appendDummyInput()
      .appendField('  适用场景')
      .appendField(new Blockly.FieldDropdown([
        ['私聊和群聊', 'ALL'],
        ['仅私聊', 'PRIVATE'],
        ['仅群聊', 'GROUP'],
      ]), 'CHAT_TYPE');
    this.appendDummyInput()
      .appendField('  运行模式')
      .appendField(new Blockly.FieldDropdown([
        ['增强模式（状态机）', 'enhanced'],
        ['经典模式（单轮）', 'classical'],
      ]), 'MODE');
    this.setColour(330);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('对话器负责接收消息、调用 AI、返回回复，对应 BaseChatter。一个插件通常只有一个');
  },
};

// Service: 后台服务（参考 BookuMemoryService）
Blockly.Blocks['comp_service'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[服务]')
      .appendField(new Blockly.FieldTextInput('my_service'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('提供后台数据服务'), 'DESC');
    this.appendDummyInput()
      .appendField('  版本')
      .appendField(new Blockly.FieldTextInput('1.0.0'), 'SVC_VERSION');
    this.setColour(38);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('后台服务组件，对应 BaseService。可以被其他组件调用，比如数据库操作');
  },
};

// EventHandler: 事件处理器（参考 MemoryFlashbackInjector / BookuMemoryStartupIngestHandler）
Blockly.Blocks['comp_event_handler'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[事件处理器]')
      .appendField(new Blockly.FieldTextInput('my_handler'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('监听并处理事件'), 'DESC');
    this.appendDummyInput()
      .appendField('  订阅事件')
      .appendField(new Blockly.FieldDropdown([
        ['收到新消息', 'ON_MESSAGE_RECEIVED'],
        ['消息发送后', 'ON_MESSAGE_SENT'],
        ['收到通知', 'ON_NOTICE_RECEIVED'],
        ['Bot 启动', 'ON_START'],
        ['Bot 关闭', 'ON_STOP'],
        ['插件全部加载完', 'ON_ALL_PLUGIN_LOADED'],
        ['插件加载', 'ON_PLUGIN_LOADED'],
        ['组件加载', 'ON_COMPONENT_LOADED'],
        ['构建提示词时', 'on_prompt_build'],
        ['自定义事件', 'CUSTOM'],
      ]), 'EVENT_TYPE');
    this.appendDummyInput()
      .appendField('  权重（越大越先执行）')
      .appendField(new Blockly.FieldNumber(0, -100, 100), 'WEIGHT');
    this.appendDummyInput()
      .appendField('  拦截消息（阻止后续处理）')
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'INTERCEPT');
    this.setColour(20);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('当某个事件发生时自动执行，对应 BaseEventHandler');
  },
};

// Agent: 自主决策智能体（参考 BookuMemoryWriteAgent / BookuMemoryReadAgent）
Blockly.Blocks['comp_agent'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[智能体]')
      .appendField(new Blockly.FieldTextInput('my_agent'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('自主决策的 AI 代理'), 'DESC');
    this.appendStatementInput('PARAMS')
      .appendField('  参数列表');
    this.setColour(260);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('智能体可以拥有自己的工具集并自主决策，对应 BaseAgent');
  },
};

// Command: 用户命令
Blockly.Blocks['comp_command'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[命令]')
      .appendField(new Blockly.FieldTextInput('help'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('显示帮助信息'), 'DESC');
    this.appendDummyInput()
      .appendField('  权限要求')
      .appendField(new Blockly.FieldDropdown([
        ['所有人', 'USER'],
        ['仅管理员', 'OPERATOR'],
        ['仅主人', 'OWNER'],
      ]), 'PERMISSION');
    this.appendStatementInput('PARAMS')
      .appendField('  参数列表');
    this.setColour(65);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('用户通过 /命令名 触发的指令，对应 BaseCommand');
  },
};

// Adapter: 平台适配器（参考 NapcatAdapter）
Blockly.Blocks['comp_adapter'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[适配器]')
      .appendField(new Blockly.FieldTextInput('my_adapter'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('连接外部平台'), 'DESC');
    this.setColour(180);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('用于对接 QQ/微信等外部平台，对应 BaseAdapter');
  },
};

// Router: HTTP 路由
Blockly.Blocks['comp_router'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[HTTP 接口]')
      .appendField(new Blockly.FieldTextInput('my_api'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('提供 HTTP API 接口'), 'DESC');
    this.setColour(290);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('提供 HTTP API 接口，可以被外部程序调用，对应 BaseRouter');
  },
};

// ========================================
// 3. 参数积木 —— 描述动作/工具/命令接收什么输入
//    直接映射到 LLM function calling 的 parameters schema
// ========================================

Blockly.Blocks['param_text'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[文字参数]')
      .appendField(new Blockly.FieldTextInput('content'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('需要输入的文字'), 'DESC');
    this.appendDummyInput()
      .appendField('  必填')
      .appendField(new Blockly.FieldCheckbox('TRUE'), 'REQUIRED');
    this.setColour(230);
    this.setPreviousStatement(true, 'param');
    this.setNextStatement(true, 'param');
    this.setTooltip('文字类型参数。AI 会根据聊天上下文自动填写，对应 schema type: string');
  },
};

Blockly.Blocks['param_number'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[数字参数]')
      .appendField(new Blockly.FieldTextInput('count'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('需要的数量'), 'DESC');
    this.appendDummyInput()
      .appendField('  必填')
      .appendField(new Blockly.FieldCheckbox('TRUE'), 'REQUIRED');
    this.setColour(230);
    this.setPreviousStatement(true, 'param');
    this.setNextStatement(true, 'param');
    this.setTooltip('数字类型参数，对应 schema type: integer');
  },
};

Blockly.Blocks['param_float'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[小数参数]')
      .appendField(new Blockly.FieldTextInput('probability'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('概率值 0~1'), 'DESC');
    this.appendDummyInput()
      .appendField('  必填')
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'REQUIRED');
    this.setColour(230);
    this.setPreviousStatement(true, 'param');
    this.setNextStatement(true, 'param');
    this.setTooltip('小数类型参数，对应 schema type: number');
  },
};

Blockly.Blocks['param_switch'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[开关参数]')
      .appendField(new Blockly.FieldTextInput('is_reply'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('是否引用原消息'), 'DESC');
    this.setColour(230);
    this.setPreviousStatement(true, 'param');
    this.setNextStatement(true, 'param');
    this.setTooltip('是/否 类型参数，对应 schema type: boolean');
  },
};

// ========================================
// 4. 配置项积木 —— 让用户可以在 config.toml 里配置你的插件
//    参考 DefaultChatterConfig / BookuMemoryConfig / NapcatAdapterConfig
// ========================================

Blockly.Blocks['setting_toggle'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[开关配置]')
      .appendField(new Blockly.FieldTextInput('enabled'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('是否启用'), 'DESC');
    this.appendDummyInput()
      .appendField('  默认')
      .appendField(new Blockly.FieldDropdown([
        ['开', 'True'],
        ['关', 'False'],
      ]), 'DEFAULT');
    this.setColour(50);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('开关配置项，生成 bool 类型的 Field');
  },
};

Blockly.Blocks['setting_text'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[文本配置]')
      .appendField(new Blockly.FieldTextInput('prefix'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('命令前缀'), 'DESC');
    this.appendDummyInput()
      .appendField('  默认值')
      .appendField(new Blockly.FieldTextInput('/'), 'DEFAULT');
    this.appendDummyInput()
      .appendField('  输入类型')
      .appendField(new Blockly.FieldDropdown([
        ['单行文本', 'text'],
        ['多行文本', 'textarea'],
        ['密码', 'password'],
      ]), 'INPUT_TYPE');
    this.setColour(50);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('文本配置项，生成 str 类型的 Field');
  },
};

Blockly.Blocks['setting_number'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[数字配置]')
      .appendField(new Blockly.FieldTextInput('max_retries'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('最大重试次数'), 'DESC');
    this.appendDummyInput()
      .appendField('  默认值')
      .appendField(new Blockly.FieldNumber(3), 'DEFAULT');
    this.appendDummyInput()
      .appendField('  最小')
      .appendField(new Blockly.FieldNumber(0), 'MIN')
      .appendField('最大')
      .appendField(new Blockly.FieldNumber(100), 'MAX');
    this.setColour(50);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('数字配置项，生成 int/float 类型的 Field，支持最小最大值约束');
  },
};

Blockly.Blocks['setting_choice'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[选择配置]')
      .appendField(new Blockly.FieldTextInput('mode'), 'NAME');
    this.appendDummyInput()
      .appendField('  描述')
      .appendField(new Blockly.FieldTextInput('运行模式'), 'DESC');
    this.appendDummyInput()
      .appendField('  选项（逗号分隔）')
      .appendField(new Blockly.FieldTextInput('enhanced,classical'), 'CHOICES');
    this.appendDummyInput()
      .appendField('  默认值')
      .appendField(new Blockly.FieldTextInput('enhanced'), 'DEFAULT');
    this.setColour(50);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('下拉选择配置项，生成 Literal 类型的 Field + choices 约束');
  },
};

// ========================================
// 5. 依赖声明
// ========================================

Blockly.Blocks['need_plugin'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[依赖插件]')
      .appendField(new Blockly.FieldTextInput('other_plugin'), 'NAME');
    this.setColour(0);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('声明依赖另一个插件，Bot 会确保那个插件先加载');
  },
};

Blockly.Blocks['need_component'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('[依赖组件]')
      .appendField(new Blockly.FieldTextInput('plugin:service:name'), 'SIGNATURE');
    this.setColour(0);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('声明依赖另一个插件的特定组件，格式：插件名:组件类型:组件名');
  },
};

// ========================================
// 6. 从 Blockly 工作区解析出完整的插件信息
// ========================================

/** 参数信息 */
export interface ParamInfo {
  name: string;
  type: 'string' | 'integer' | 'number' | 'boolean';
  description: string;
  required: boolean;
}

/** 设置项信息 */
export interface SettingInfo {
  name: string;
  type: 'bool' | 'str' | 'int' | 'float';
  description: string;
  default_value: string;
  input_type?: string;
  choices?: string[];
  min?: number;
  max?: number;
}

/** 从积木工作区解析的完整插件数据 */
export interface ParsedPlugin {
  name: string;
  version: string;
  description: string;
  components: ComponentDefinition[];
  settings: SettingInfo[];
  dependencies: string[];        // 插件级依赖
  componentDeps: string[];       // 组件级依赖（signature 格式）
}

/** 遍历 statement 链上的所有块 */
function walkChain(startBlock: Blockly.Block | null): Blockly.Block[] {
  const blocks: Blockly.Block[] = [];
  let current = startBlock;
  while (current) {
    blocks.push(current);
    current = current.getNextBlock();
  }
  return blocks;
}

/** 解析参数积木链 */
function parseParams(firstBlock: Blockly.Block | null): ParamInfo[] {
  const params: ParamInfo[] = [];
  for (const b of walkChain(firstBlock)) {
    const type = b.type;
    if (type === 'param_text') {
      params.push({
        name: b.getFieldValue('NAME') || 'param',
        type: 'string',
        description: b.getFieldValue('DESC') || '',
        required: b.getFieldValue('REQUIRED') === 'TRUE',
      });
    } else if (type === 'param_number') {
      params.push({
        name: b.getFieldValue('NAME') || 'param',
        type: 'integer',
        description: b.getFieldValue('DESC') || '',
        required: b.getFieldValue('REQUIRED') === 'TRUE',
      });
    } else if (type === 'param_float') {
      params.push({
        name: b.getFieldValue('NAME') || 'param',
        type: 'number',
        description: b.getFieldValue('DESC') || '',
        required: b.getFieldValue('REQUIRED') === 'TRUE',
      });
    } else if (type === 'param_switch') {
      params.push({
        name: b.getFieldValue('NAME') || 'param',
        type: 'boolean',
        description: b.getFieldValue('DESC') || '',
        required: false,
      });
    }
  }
  return params;
}

/** 积木 type → ComponentDefinition.type 映射 */
const COMP_TYPE_MAP: Record<string, ComponentDefinition['type']> = {
  comp_action: 'action',
  comp_tool: 'tool',
  comp_chatter: 'chatter',
  comp_service: 'service',
  comp_event_handler: 'event_handler',
  comp_command: 'command',
  comp_agent: 'agent',
  comp_adapter: 'adapter',
  comp_router: 'router',
};

/**
 * 从 Blockly workspace 读取 plugin_main 积木，
 * 返回完整的 ParsedPlugin 供代码生成器使用。
 */
export function parseWorkspace(ws: Blockly.Workspace): ParsedPlugin | null {
  const mainBlocks = ws.getBlocksByType('plugin_main', false);
  if (mainBlocks.length === 0) return null;
  const main = mainBlocks[0];

  const result: ParsedPlugin = {
    name: main.getFieldValue('NAME') || 'my_plugin',
    version: main.getFieldValue('VERSION') || '1.0.0',
    description: main.getFieldValue('DESC') || '',
    components: [],
    settings: [],
    dependencies: [],
    componentDeps: [],
  };

  // 遍历 COMPONENTS statement 里的所有积木
  const firstChild = main.getInputTargetBlock('COMPONENTS');
  for (const block of walkChain(firstChild)) {
    const btype = block.type;

    // 组件积木
    if (COMP_TYPE_MAP[btype]) {
      const comp: ComponentDefinition = {
        type: COMP_TYPE_MAP[btype],
        name: block.getFieldValue('NAME') || 'unnamed',
        description: block.getFieldValue('DESC') || '',
      };

      // 提取元数据
      const metadata: Record<string, any> = {};
      if (block.getField('CHAT_TYPE')) metadata.chatType = block.getFieldValue('CHAT_TYPE');
      if (block.getField('ACTIVATION')) metadata.activation = block.getFieldValue('ACTIVATION');
      if (block.getField('EVENT_TYPE')) metadata.eventType = block.getFieldValue('EVENT_TYPE');
      if (block.getField('PERMISSION')) metadata.permission = block.getFieldValue('PERMISSION');
      if (block.getField('PRIMARY')) metadata.primary = block.getFieldValue('PRIMARY') === 'TRUE';
      if (block.getField('MODE')) metadata.mode = block.getFieldValue('MODE');
      if (block.getField('SVC_VERSION')) metadata.svcVersion = block.getFieldValue('SVC_VERSION');
      if (block.getField('WEIGHT')) metadata.weight = block.getFieldValue('WEIGHT');
      if (block.getField('INTERCEPT')) metadata.intercept = block.getFieldValue('INTERCEPT') === 'TRUE';
      if (Object.keys(metadata).length > 0) comp.metadata = metadata;

      // 提取参数
      const paramsBlock = block.getInputTargetBlock('PARAMS');
      if (paramsBlock) {
        comp.params = parseParams(paramsBlock);
      }

      result.components.push(comp);
    }

    // 设置积木
    if (btype === 'setting_toggle') {
      result.settings.push({
        name: block.getFieldValue('NAME') || 'enabled',
        type: 'bool',
        description: block.getFieldValue('DESC') || '',
        default_value: block.getFieldValue('DEFAULT') || 'True',
      });
    } else if (btype === 'setting_text') {
      result.settings.push({
        name: block.getFieldValue('NAME') || 'value',
        type: 'str',
        description: block.getFieldValue('DESC') || '',
        default_value: block.getFieldValue('DEFAULT') || '',
        input_type: block.getFieldValue('INPUT_TYPE') || 'text',
      });
    } else if (btype === 'setting_number') {
      result.settings.push({
        name: block.getFieldValue('NAME') || 'value',
        type: 'int',
        description: block.getFieldValue('DESC') || '',
        default_value: String(block.getFieldValue('DEFAULT') ?? 0),
        min: Number(block.getFieldValue('MIN') ?? 0),
        max: Number(block.getFieldValue('MAX') ?? 100),
      });
    } else if (btype === 'setting_choice') {
      const choicesStr = block.getFieldValue('CHOICES') || '';
      result.settings.push({
        name: block.getFieldValue('NAME') || 'mode',
        type: 'str',
        description: block.getFieldValue('DESC') || '',
        default_value: block.getFieldValue('DEFAULT') || '',
        choices: choicesStr.split(',').map((s: string) => s.trim()).filter(Boolean),
      });
    }

    // 依赖积木
    if (btype === 'need_plugin') {
      const depName = block.getFieldValue('NAME');
      if (depName) result.dependencies.push(depName);
    } else if (btype === 'need_component') {
      const sig = block.getFieldValue('SIGNATURE');
      if (sig) result.componentDeps.push(sig);
    }
  }

  return result;
}

// 保留旧 export（向后兼容）
export const customPythonGenerator = {};
