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
  text_mofox: (block: any) => {
    const text = block.getFieldValue('TEXT');
    return [`"${text}"`, Blockly.JavaScript.ORDER_ATOMIC];
  },
};
