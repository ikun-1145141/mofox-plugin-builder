import * as Blockly from 'blockly';

/**
 * 定义 MoFox Plugin Builder 的自定义积木
 */

// 插件声明积木
Blockly.Blocks['plugin_declare'] = {
  init: function() {
    this.appendValueInput('PLUGIN_NAME')
      .setCheck('String')
      .appendField('插件');
    this.appendValueInput('VERSION')
      .setCheck('String')
      .appendField('版本');
    this.setColour(120);
    this.setTooltip('声明插件名称和版本');
    this.setHelpUrl('');
  }
};

// Action 组件积木
Blockly.Blocks['component_action'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Action');
    this.appendValueInput('NAME')
      .setCheck('String')
      .appendField('名称');
    this.appendValueInput('DESCRIPTION')
      .setCheck('String')
      .appendField('说明');
    this.setColour(208);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('创建 Action 组件');
  }
};

// Tool 组件积木
Blockly.Blocks['component_tool'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Tool');
    this.appendValueInput('NAME')
      .setCheck('String')
      .appendField('名称');
    this.appendValueInput('DESCRIPTION')
      .setCheck('String')
      .appendField('说明');
    this.setColour(207);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('创建 Tool 组件');
  }
};

// Service 组件积木
Blockly.Blocks['component_service'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Service');
    this.appendValueInput('NAME')
      .setCheck('String')
      .appendField('名称');
    this.appendValueInput('DESCRIPTION')
      .setCheck('String')
      .appendField('说明');
    this.setColour(38);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('创建 Service 组件');
  }
};

// Chatter 组件积木
Blockly.Blocks['component_chatter'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Chatter 聊天器');
    this.appendValueInput('NAME')
      .setCheck('String')
      .appendField('名称');
    this.appendValueInput('DESCRIPTION')
      .setCheck('String')
      .appendField('说明');
    this.appendDummyInput()
      .appendField('聊天类型')
      .appendField(new Blockly.FieldDropdown([
        ['全部', 'ALL'],
        ['私聊', 'PRIVATE'],
        ['群聊', 'GROUP'],
      ]), 'CHAT_TYPE');
    this.setColour(330);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('创建 Chatter 聊天器组件，处理对话逻辑');
  }
};

// Agent 组件积木
Blockly.Blocks['component_agent'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Agent 代理');
    this.appendValueInput('NAME')
      .setCheck('String')
      .appendField('名称');
    this.appendValueInput('DESCRIPTION')
      .setCheck('String')
      .appendField('说明');
    this.setColour(260);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('创建 Agent 代理组件');
  }
};

// EventHandler 组件积木
Blockly.Blocks['component_event_handler'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('EventHandler 事件处理');
    this.appendValueInput('NAME')
      .setCheck('String')
      .appendField('名称');
    this.appendValueInput('DESCRIPTION')
      .setCheck('String')
      .appendField('说明');
    this.appendDummyInput()
      .appendField('订阅事件')
      .appendField(new Blockly.FieldDropdown([
        ['消息接收', 'ON_MESSAGE_RECEIVED'],
        ['消息发送', 'ON_MESSAGE_SENT'],
        ['通知接收', 'ON_NOTICE_RECEIVED'],
        ['启动', 'ON_START'],
        ['停止', 'ON_STOP'],
        ['插件加载', 'ON_PLUGIN_LOADED'],
        ['组件加载', 'ON_COMPONENT_LOADED'],
        ['自定义', 'CUSTOM'],
      ]), 'EVENT_TYPE');
    this.appendDummyInput()
      .appendField('拦截消息')
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'INTERCEPT');
    this.setColour(20);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('创建事件处理器，订阅系统事件');
  }
};

// Adapter 组件积木
Blockly.Blocks['component_adapter'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Adapter 适配器');
    this.appendValueInput('NAME')
      .setCheck('String')
      .appendField('名称');
    this.appendValueInput('DESCRIPTION')
      .setCheck('String')
      .appendField('说明');
    this.setColour(180);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('创建 Adapter 适配器组件');
  }
};

// Command 组件积木
Blockly.Blocks['component_command'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Command 命令');
    this.appendValueInput('NAME')
      .setCheck('String')
      .appendField('名称');
    this.appendValueInput('DESCRIPTION')
      .setCheck('String')
      .appendField('说明');
    this.appendDummyInput()
      .appendField('权限级别')
      .appendField(new Blockly.FieldDropdown([
        ['用户', 'USER'],
        ['访客', 'GUEST'],
        ['管理员', 'OPERATOR'],
        ['所有者', 'OWNER'],
      ]), 'PERMISSION');
    this.setColour(65);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('创建命令组件，响应用户指令');
  }
};

// Config 组件积木
Blockly.Blocks['component_config'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Config 配置');
    this.appendValueInput('NAME')
      .setCheck('String')
      .appendField('名称');
    this.appendStatementInput('SECTIONS')
      .appendField('配置段');
    this.setColour(50);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('创建插件配置类');
  }
};

// Router 组件积木
Blockly.Blocks['component_router'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Router 路由');
    this.appendValueInput('NAME')
      .setCheck('String')
      .appendField('名称');
    this.appendValueInput('DESCRIPTION')
      .setCheck('String')
      .appendField('说明');
    this.setColour(290);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('创建 HTTP 路由组件');
  }
};

// 事件订阅积木
Blockly.Blocks['event_subscribe'] = {
  init: function() {
    this.appendValueInput('EVENT_NAME')
      .setCheck('String')
      .appendField('订阅事件');
    this.appendStatementInput('DO')
      .appendField('执行');
    this.setColour(160);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('订阅事件并处理');
  }
};

// 事件发布积木
Blockly.Blocks['event_publish'] = {
  init: function() {
    this.appendValueInput('EVENT_NAME')
      .setCheck('String')
      .appendField('发布事件');
    this.appendValueInput('DATA')
      .setCheck(null)
      .appendField('数据');
    this.setColour(160);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('发布事件');
  }
};

// 字符串积木
Blockly.Blocks['text_mofox'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('文本')
      .appendField(new Blockly.FieldTextInput('默认文本'), 'TEXT');
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('字符串文本');
  }
};

// 数字积木
Blockly.Blocks['number_mofox'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('数字')
      .appendField(new Blockly.FieldNumber(0), 'NUM');
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('数字值');
  }
};

// 布尔值积木
Blockly.Blocks['bool_mofox'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('布尔')
      .appendField(new Blockly.FieldDropdown([
        ['True', 'TRUE'],
        ['False', 'FALSE'],
      ]), 'BOOL');
    this.setOutput(true, 'Boolean');
    this.setColour(210);
    this.setTooltip('布尔值 True/False');
  }
};

// 参数定义积木（用于 Action/Tool 的 execute 参数，生成 LLM tool schema）
Blockly.Blocks['param_define'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('参数');
    this.appendDummyInput()
      .appendField('名称')
      .appendField(new Blockly.FieldTextInput('param_name'), 'PARAM_NAME');
    this.appendDummyInput()
      .appendField('类型')
      .appendField(new Blockly.FieldDropdown([
        ['字符串', 'string'],
        ['整数', 'integer'],
        ['浮点数', 'number'],
        ['布尔', 'boolean'],
      ]), 'PARAM_TYPE');
    this.appendDummyInput()
      .appendField('描述')
      .appendField(new Blockly.FieldTextInput('参数描述'), 'PARAM_DESC');
    this.appendDummyInput()
      .appendField('必填')
      .appendField(new Blockly.FieldCheckbox('TRUE'), 'REQUIRED');
    this.setColour(230);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('定义 Action/Tool 的参数（会生成 LLM tool schema）');
  }
};

// 配置段积木（config_section）
Blockly.Blocks['config_section'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('配置段')
      .appendField(new Blockly.FieldTextInput('plugin'), 'SECTION_NAME');
    this.appendDummyInput()
      .appendField('标题')
      .appendField(new Blockly.FieldTextInput('插件设置'), 'SECTION_TITLE');
    this.appendStatementInput('FIELDS')
      .appendField('字段');
    this.setColour(50);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('定义配置段 @config_section');
  }
};

// 配置字段积木（Field）
Blockly.Blocks['config_field'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('配置字段');
    this.appendDummyInput()
      .appendField('名称')
      .appendField(new Blockly.FieldTextInput('enabled'), 'FIELD_NAME');
    this.appendDummyInput()
      .appendField('类型')
      .appendField(new Blockly.FieldDropdown([
        ['布尔', 'bool'],
        ['字符串', 'str'],
        ['整数', 'int'],
        ['浮点数', 'float'],
        ['列表', 'list'],
      ]), 'FIELD_TYPE');
    this.appendDummyInput()
      .appendField('默认值')
      .appendField(new Blockly.FieldTextInput('True'), 'DEFAULT_VAL');
    this.appendDummyInput()
      .appendField('说明')
      .appendField(new Blockly.FieldTextInput('字段描述'), 'FIELD_DESC');
    this.setColour(50);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('定义配置项 Field(default=..., description=...)');
  }
};

// 组件依赖声明积木
Blockly.Blocks['dependency_declare'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('依赖');
    this.appendDummyInput()
      .appendField('类型')
      .appendField(new Blockly.FieldDropdown([
        ['插件依赖', 'plugin'],
        ['组件依赖', 'component'],
      ]), 'DEP_TYPE');
    this.appendDummyInput()
      .appendField('名称')
      .appendField(new Blockly.FieldTextInput('plugin_name'), 'DEP_NAME');
    this.setColour(0);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('声明插件或组件依赖（如 my_plugin:service:queue）');
  }
};

// Action 激活方式积木
Blockly.Blocks['action_activation'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('激活方式');
    this.appendDummyInput()
      .appendField('方式')
      .appendField(new Blockly.FieldDropdown([
        ['随机概率', 'random'],
        ['关键词匹配', 'keyword'],
        ['LLM 判断', 'llm_judge'],
        ['始终激活', 'always'],
      ]), 'ACTIVATION_TYPE');
    this.appendDummyInput()
      .appendField('参数')
      .appendField(new Blockly.FieldTextInput('0.5'), 'ACTIVATION_PARAM');
    this.setColour(208);
    this.setOutput(true, 'Activation');
    this.setTooltip('选择 Action 的 go_activate 激活方式');
  }
};

// ChatType 选择积木
Blockly.Blocks['chat_type'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('聊天类型')
      .appendField(new Blockly.FieldDropdown([
        ['全部', 'ALL'],
        ['私聊', 'PRIVATE'],
        ['群聊', 'GROUP'],
      ]), 'CHAT_TYPE');
    this.setOutput(true, 'ChatType');
    this.setColour(160);
    this.setTooltip('选择聊天类型限制');
  }
};

// 自定义 Python 代码块
Blockly.Blocks['python_code'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('Python 代码');
    this.appendDummyInput()
      .appendField(new Blockly.FieldMultilineInput('pass'), 'CODE');
    this.setColour(180);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('直接插入自定义 Python 代码');
  }
};

// 生成器映射
export const customPythonGenerator = {
  plugin_declare: (block: any) => {
    const name = block.getInputTargetBlock('PLUGIN_NAME')?.getFieldValue('TEXT') || 'my_plugin';
    const version = block.getInputTargetBlock('VERSION')?.getFieldValue('TEXT') || '1.0.0';
    return `# plugin_name: ${name}\n# version: ${version}`;
  },
  component_action: (block: any) => {
    const name = block.getInputTargetBlock('NAME')?.getFieldValue('TEXT') || 'my_action';
    return `class ${Blockly.Names.sanitizeName_(name)}(BaseAction):\n  pass`;
  },
  component_tool: (block: any) => {
    const name = block.getInputTargetBlock('NAME')?.getFieldValue('TEXT') || 'my_tool';
    return `class ${Blockly.Names.sanitizeName_(name)}(BaseTool):\n  pass`;
  },
  component_service: (block: any) => {
    const name = block.getInputTargetBlock('NAME')?.getFieldValue('TEXT') || 'my_service';
    return `class ${Blockly.Names.sanitizeName_(name)}(BaseService):\n  pass`;
  },
  component_chatter: (block: any) => {
    const name = block.getInputTargetBlock('NAME')?.getFieldValue('TEXT') || 'my_chatter';
    const chatType = block.getFieldValue('CHAT_TYPE') || 'ALL';
    return `class ${Blockly.Names.sanitizeName_(name)}(BaseChatter):\n  chat_type = ChatType.${chatType}\n  pass`;
  },
  component_agent: (block: any) => {
    const name = block.getInputTargetBlock('NAME')?.getFieldValue('TEXT') || 'my_agent';
    return `class ${Blockly.Names.sanitizeName_(name)}(BaseAgent):\n  pass`;
  },
  component_event_handler: (block: any) => {
    const name = block.getInputTargetBlock('NAME')?.getFieldValue('TEXT') || 'my_handler';
    const eventType = block.getFieldValue('EVENT_TYPE') || 'ON_MESSAGE_RECEIVED';
    return `class ${Blockly.Names.sanitizeName_(name)}(BaseEventHandler):\n  init_subscribe = ["${eventType}"]\n  pass`;
  },
  component_command: (block: any) => {
    const name = block.getInputTargetBlock('NAME')?.getFieldValue('TEXT') || 'my_command';
    const perm = block.getFieldValue('PERMISSION') || 'USER';
    return `class ${Blockly.Names.sanitizeName_(name)}(BaseCommand):\n  permission_level = PermissionLevel.${perm}\n  pass`;
  },
  component_adapter: (block: any) => {
    const name = block.getInputTargetBlock('NAME')?.getFieldValue('TEXT') || 'my_adapter';
    return `class ${Blockly.Names.sanitizeName_(name)}(BaseAdapter):\n  pass`;
  },
  component_config: (block: any) => {
    const name = block.getInputTargetBlock('NAME')?.getFieldValue('TEXT') || 'my_config';
    return `class ${Blockly.Names.sanitizeName_(name)}(BaseConfig):\n  pass`;
  },
  component_router: (block: any) => {
    const name = block.getInputTargetBlock('NAME')?.getFieldValue('TEXT') || 'my_router';
    return `class ${Blockly.Names.sanitizeName_(name)}(BaseRouter):\n  pass`;
  },
  text_mofox: (block: any) => {
    const text = block.getFieldValue('TEXT');
    return [`"${text}"`, 0];
  },
  number_mofox: (block: any) => {
    const num = block.getFieldValue('NUM');
    return [`${num}`, 0];
  },
  bool_mofox: (block: any) => {
    const val = block.getFieldValue('BOOL');
    return [val === 'TRUE' ? 'True' : 'False', 0];
  },
  param_define: (block: any) => {
    const name = block.getFieldValue('PARAM_NAME') || 'param';
    const type = block.getFieldValue('PARAM_TYPE') || 'string';
    const desc = block.getFieldValue('PARAM_DESC') || '';
    return `# param: ${name} (${type}) - ${desc}`;
  },
  config_section: (block: any) => {
    const name = block.getFieldValue('SECTION_NAME') || 'plugin';
    const title = block.getFieldValue('SECTION_TITLE') || '设置';
    return `@config_section("${name}", title="${title}")`;
  },
  config_field: (block: any) => {
    const name = block.getFieldValue('FIELD_NAME') || 'field';
    const type = block.getFieldValue('FIELD_TYPE') || 'str';
    const defaultVal = block.getFieldValue('DEFAULT_VAL') || '';
    const desc = block.getFieldValue('FIELD_DESC') || '';
    return `${name}: ${type} = Field(default=${defaultVal}, description="${desc}")`;
  },
  dependency_declare: (block: any) => {
    const depType = block.getFieldValue('DEP_TYPE') || 'plugin';
    const depName = block.getFieldValue('DEP_NAME') || '';
    return `# dependency (${depType}): ${depName}`;
  },
  action_activation: (block: any) => {
    const type = block.getFieldValue('ACTIVATION_TYPE') || 'always';
    const param = block.getFieldValue('ACTIVATION_PARAM') || '';
    return [`# activation: ${type}(${param})`, 0];
  },
  chat_type: (block: any) => {
    const chatType = block.getFieldValue('CHAT_TYPE') || 'ALL';
    return [`ChatType.${chatType}`, 0];
  },
  python_code: (block: any) => {
    const code = block.getFieldValue('CODE') || 'pass';
    return code;
  },
  event_subscribe: (block: any) => {
    const eventName = block.getInputTargetBlock('EVENT_NAME')?.getFieldValue('TEXT') || 'event';
    return `# subscribe: ${eventName}`;
  },
  event_publish: (block: any) => {
    const eventName = block.getInputTargetBlock('EVENT_NAME')?.getFieldValue('TEXT') || 'event';
    return `# publish: ${eventName}`;
  },
};
