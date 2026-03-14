import * as Blockly from 'blockly';
import type { ComponentDefinition } from '@/types/plugin';

/**
 * MoFox 插件积木 —— 面向零基础用户
 *
 * 设计原则：
 *   1. 所有文字用自然语言，不出现英文术语
 *   2. 嵌套容器结构：「我的插件」→「组件」→「参数 / 设置」
 *   3. 所有信息直接内联在积木上（FieldTextInput / FieldDropdown），
 *      不需要额外拖一个"文本"积木来连线
 */

// ═══════════════════════════════════════════
// 1. 插件主体 —— 最外层容器
// ═══════════════════════════════════════════
Blockly.Blocks['plugin_main'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🦊 我的插件')
      .appendField(new Blockly.FieldTextInput('my_plugin'), 'NAME');
    this.appendDummyInput()
      .appendField('    版本')
      .appendField(new Blockly.FieldTextInput('1.0.0'), 'VERSION');
    this.appendDummyInput()
      .appendField('    简介')
      .appendField(new Blockly.FieldTextInput('这是一个 MoFox 插件'), 'DESC');
    this.appendStatementInput('COMPONENTS')
      .appendField('包含的功能 ▼');
    this.setColour(270);
    this.setDeletable(false);
    this.setTooltip('插件的总入口，把下面的功能积木拖进来');
  },
};

// ═══════════════════════════════════════════
// 2. 功能组件 —— 拖进「我的插件」里
// ═══════════════════════════════════════════

// —— 动作：Bot 主动做的事（发消息、查天气…）——
Blockly.Blocks['comp_action'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('⚡ 动作')
      .appendField(new Blockly.FieldTextInput('send_text'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('发送一条文本消息'), 'DESC');
    this.appendDummyInput()
      .appendField('    触发方式')
      .appendField(new Blockly.FieldDropdown([
        ['由 AI 自动决定', 'llm_judge'],
        ['关键词匹配', 'keyword'],
        ['随机概率', 'random'],
        ['始终触发', 'always'],
      ]), 'ACTIVATION');
    this.appendDummyInput()
      .appendField('    适用场景')
      .appendField(new Blockly.FieldDropdown([
        ['私聊和群聊', 'ALL'],
        ['仅私聊', 'PRIVATE'],
        ['仅群聊', 'GROUP'],
      ]), 'CHAT_TYPE');
    this.appendStatementInput('PARAMS')
      .appendField('    需要的参数 ▼');
    this.setColour(208);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('让 Bot 能执行一个动作。比如"发送消息"、"查询天气"');
  },
};

// —— 工具：AI 可以调用的工具 ——
Blockly.Blocks['comp_tool'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🔧 工具')
      .appendField(new Blockly.FieldTextInput('search_web'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('搜索网页内容'), 'DESC');
    this.appendDummyInput()
      .appendField('    适用场景')
      .appendField(new Blockly.FieldDropdown([
        ['私聊和群聊', 'ALL'],
        ['仅私聊', 'PRIVATE'],
        ['仅群聊', 'GROUP'],
      ]), 'CHAT_TYPE');
    this.appendStatementInput('PARAMS')
      .appendField('    需要的参数 ▼');
    this.setColour(160);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('给 AI 一个可调用的工具。比如"搜索网页"、"计算数学"');
  },
};

// —— 对话器：处理聊天的核心逻辑 ——
Blockly.Blocks['comp_chatter'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('💬 对话器')
      .appendField(new Blockly.FieldTextInput('my_chatter'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('处理用户对话'), 'DESC');
    this.appendDummyInput()
      .appendField('    适用场景')
      .appendField(new Blockly.FieldDropdown([
        ['私聊和群聊', 'ALL'],
        ['仅私聊', 'PRIVATE'],
        ['仅群聊', 'GROUP'],
      ]), 'CHAT_TYPE');
    this.setColour(330);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('对话器负责接收消息、调用 AI、返回回复。一般一个插件只需要一个');
  },
};

// —— 服务：在后台运行的功能模块 ——
Blockly.Blocks['comp_service'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🔌 后台服务')
      .appendField(new Blockly.FieldTextInput('my_service'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('提供后台数据服务'), 'DESC');
    this.setColour(38);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('后台服务，可以被其他组件调用。比如数据库、缓存');
  },
};

// —— 事件监听器：当某事发生时… ——
Blockly.Blocks['comp_event_handler'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('👂 当')
      .appendField(new Blockly.FieldDropdown([
        ['收到新消息', 'ON_MESSAGE_RECEIVED'],
        ['消息发出后', 'ON_MESSAGE_SENT'],
        ['收到通知', 'ON_NOTICE_RECEIVED'],
        ['Bot 启动', 'ON_START'],
        ['Bot 关闭', 'ON_STOP'],
        ['插件加载完', 'ON_PLUGIN_LOADED'],
        ['自定义事件', 'CUSTOM'],
      ]), 'EVENT_TYPE')
      .appendField('时');
    this.appendDummyInput()
      .appendField('    名称')
      .appendField(new Blockly.FieldTextInput('my_handler'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('监听并处理事件'), 'DESC');
    this.setColour(20);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('当某个事件发生时自动执行。比如"收到消息时记录日志"');
  },
};

// —— 命令：用户输入指令触发 ——
Blockly.Blocks['comp_command'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('📝 命令')
      .appendField(new Blockly.FieldTextInput('help'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('显示帮助信息'), 'DESC');
    this.appendDummyInput()
      .appendField('    谁能用')
      .appendField(new Blockly.FieldDropdown([
        ['所有人', 'USER'],
        ['仅管理员', 'OPERATOR'],
        ['仅主人', 'OWNER'],
      ]), 'PERMISSION');
    this.appendStatementInput('PARAMS')
      .appendField('    命令参数 ▼');
    this.setColour(65);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('用户输入 /命令名 来触发。比如 /help、/设置');
  },
};

// —— 智能体：可以自主决策的 AI 代理 ——
Blockly.Blocks['comp_agent'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🤖 智能体')
      .appendField(new Blockly.FieldTextInput('my_agent'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('自主决策的 AI 代理'), 'DESC');
    this.setColour(260);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('智能体可以自主思考和决策，用于复杂的 AI 任务');
  },
};

// —— 适配器：连接外部平台 ——
Blockly.Blocks['comp_adapter'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🔗 适配器')
      .appendField(new Blockly.FieldTextInput('my_adapter'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('连接外部平台'), 'DESC');
    this.setColour(180);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('用于对接QQ、微信等外部平台的消息接口');
  },
};

// —— 路由：提供 HTTP 接口 ——
Blockly.Blocks['comp_router'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🌐 网页接口')
      .appendField(new Blockly.FieldTextInput('my_api'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('提供 HTTP API'), 'DESC');
    this.setColour(290);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('提供网页接口（HTTP API），可以被外部程序调用');
  },
};

// ═══════════════════════════════════════════
// 3. 参数积木 —— 拖进「动作/工具/命令」里描述需要什么输入
// ═══════════════════════════════════════════

Blockly.Blocks['param_text'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('📋 文字参数')
      .appendField(new Blockly.FieldTextInput('content'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('需要输入的文字'), 'DESC');
    this.appendDummyInput()
      .appendField('    必填')
      .appendField(new Blockly.FieldCheckbox('TRUE'), 'REQUIRED');
    this.setColour(230);
    this.setPreviousStatement(true, 'param');
    this.setNextStatement(true, 'param');
    this.setTooltip('一个文字类型的参数，AI 会根据上下文自动填写');
  },
};

Blockly.Blocks['param_number'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🔢 数字参数')
      .appendField(new Blockly.FieldTextInput('count'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('需要的数量'), 'DESC');
    this.appendDummyInput()
      .appendField('    必填')
      .appendField(new Blockly.FieldCheckbox('TRUE'), 'REQUIRED');
    this.setColour(230);
    this.setPreviousStatement(true, 'param');
    this.setNextStatement(true, 'param');
    this.setTooltip('一个数字类型的参数');
  },
};

Blockly.Blocks['param_switch'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('🔘 开关参数')
      .appendField(new Blockly.FieldTextInput('is_reply'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('是否引用原消息'), 'DESC');
    this.setColour(230);
    this.setPreviousStatement(true, 'param');
    this.setNextStatement(true, 'param');
    this.setTooltip('一个「是/否」类型的参数');
  },
};

// ═══════════════════════════════════════════
// 4. 设置积木 —— 拖进「我的插件」里，让用户能配置你的插件
// ═══════════════════════════════════════════

Blockly.Blocks['setting_toggle'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('⚙️ 开关设置')
      .appendField(new Blockly.FieldTextInput('enabled'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('是否启用'), 'DESC');
    this.appendDummyInput()
      .appendField('    默认')
      .appendField(new Blockly.FieldDropdown([
        ['开', 'True'],
        ['关', 'False'],
      ]), 'DEFAULT');
    this.setColour(50);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('添加一个开关设置项，用户可以在配置文件里开关它');
  },
};

Blockly.Blocks['setting_text'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('⚙️ 文本设置')
      .appendField(new Blockly.FieldTextInput('prefix'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('命令前缀'), 'DESC');
    this.appendDummyInput()
      .appendField('    默认值')
      .appendField(new Blockly.FieldTextInput('/'), 'DEFAULT');
    this.setColour(50);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('添加一个文本设置项');
  },
};

Blockly.Blocks['setting_number'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('⚙️ 数字设置')
      .appendField(new Blockly.FieldTextInput('max_retries'), 'NAME');
    this.appendDummyInput()
      .appendField('    说明')
      .appendField(new Blockly.FieldTextInput('最大重试次数'), 'DESC');
    this.appendDummyInput()
      .appendField('    默认值')
      .appendField(new Blockly.FieldNumber(3), 'DEFAULT');
    this.setColour(50);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('添加一个数字设置项');
  },
};

// ═══════════════════════════════════════════
// 5. 依赖声明 —— 声明你的插件需要哪些其他插件
// ═══════════════════════════════════════════

Blockly.Blocks['need_plugin'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('📦 需要插件')
      .appendField(new Blockly.FieldTextInput('other_plugin'), 'NAME');
    this.setColour(0);
    this.setPreviousStatement(true, 'component');
    this.setNextStatement(true, 'component');
    this.setTooltip('声明依赖另一个插件，Bot 会确保那个插件先加载');
  },
};

// ═══════════════════════════════════════════
// 6. 从 Blockly 工作区解析出完整的插件信息
// ═══════════════════════════════════════════

/** 参数信息 */
export interface ParamInfo {
  name: string;
  type: 'string' | 'integer' | 'boolean';
  description: string;
  required: boolean;
}

/** 设置项信息 */
export interface SettingInfo {
  name: string;
  type: 'bool' | 'str' | 'int' | 'float';
  description: string;
  default_value: string;
}

/** 从积木工作区解析的完整插件数据 */
export interface ParsedPlugin {
  name: string;
  version: string;
  description: string;
  components: ComponentDefinition[];
  settings: SettingInfo[];
  dependencies: string[];
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
      });
    } else if (btype === 'setting_number') {
      result.settings.push({
        name: block.getFieldValue('NAME') || 'value',
        type: 'int',
        description: block.getFieldValue('DESC') || '',
        default_value: String(block.getFieldValue('DEFAULT') ?? 0),
      });
    }

    // 依赖积木
    if (btype === 'need_plugin') {
      const depName = block.getFieldValue('NAME');
      if (depName) result.dependencies.push(depName);
    }
  }

  return result;
}

// 保留旧 export（向后兼容）
export const customPythonGenerator = {};
