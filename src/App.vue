<template>
  <div :class="['app-container', { dark: isDark }]">
    <!-- Theme Toggle (fixed) -->
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换浅色' : '切换深色'">
      <span class="material-symbols-rounded">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
    </button>

    <div class="body-layout">
      <!-- Sidebar -->
      <nav class="sidebar">
        <div class="nav-title">
          <span class="material-symbols-rounded">smart_toy</span>
          MoFox
        </div>
        <div class="nav-section-label">菜单</div>
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.id" 
              :class="['nav-item', { active: currentView === item.id }]"
              @click="currentView = item.id">
            <span class="material-symbols-rounded">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </li>
        </ul>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Project Settings View -->
        <section v-if="currentView === 'project'" class="view">
          <h2>项目设置</h2>
          <div class="form-card expressive">
            <div class="form-group">
              <label>插件名称</label>
              <input 
                v-model="pluginStore.pluginName" 
                type="text" 
                class="input-field"
                placeholder="如：my_awesome_plugin"
              />
            </div>
            <div class="form-group">
              <label>版本号</label>
              <input 
                v-model="pluginStore.pluginVersion" 
                type="text"
                class="input-field"
                placeholder="1.0.0"
              />
            </div>
            <div class="form-group">
              <label>插件描述</label>
              <textarea 
                v-model="pluginStore.pluginDescription"
                class="input-field"
                placeholder="描述你的插件功能..."
                rows="4"
              />
            </div>
            <button class="btn-primary expressive" @click="saveProject">保存项目</button>
          </div>
        </section>

        <!-- Blockly Editor View -->
        <section v-if="currentView === 'blocks'" class="view">
          <h2>积木编辑器</h2>
          <div class="card expressive">
            <div ref="blocklyDiv" class="blockly-container"></div>
            <div class="button-bar">
              <button class="btn-primary expressive" @click="generateCode">生成代码</button>
            </div>
          </div>
        </section>

        <!-- Components View -->
        <section v-if="currentView === 'components'" class="view">
          <h2>组件管理</h2>
          <div class="card expressive">
            <div class="comp-list">
              <div v-for="(comp, idx) in pluginStore.components" :key="idx" class="comp-item expressive">
                <span class="comp-badge" :data-type="comp.type">{{ comp.type }}</span>
                <span class="comp-name">{{ comp.name }}</span>
                <button class="btn-small" @click="pluginStore.removeComponent(idx)">删除</button>
              </div>
              <div v-if="pluginStore.components.length === 0" class="empty-state">
                <p>还没有添加任何组件</p>
                <p class="hint">向下添加新组件开始吧</p>
              </div>
            </div>

            <div class="add-comp-section expressive">
              <h3>添加新组件</h3>
              <div class="form-row">
                <select v-model="selectedComponentType" class="input-field">
                  <option value="">-- 选择类型 --</option>
                  <option value="action">Action 动作</option>
                  <option value="tool">Tool 工具</option>
                  <option value="service">Service 服务</option>
                  <option value="chatter">Chatter 聊天器</option>
                  <option value="event_handler">EventHandler 事件处理</option>
                  <option value="agent">Agent 代理</option>
                  <option value="adapter">Adapter 适配器</option>
                </select>
                <input 
                  v-model="newComponentName"
                  type="text"
                  class="input-field"
                  placeholder="组件名称"
                />
                <button class="btn-secondary expressive" @click="addComponent">添加</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Code Preview View -->
        <section v-if="currentView === 'code'" class="view">
          <h2>生成的代码</h2>
          <div class="card expressive">
            <div class="tabs">
              <button 
                v-for="tab in codeTabs" 
                :key="tab"
                :class="['tab-btn', { active: activeTab === tab }]"
                @click="activeTab = tab"
              >
                {{ tab }}
              </button>
            </div>
            <div class="code-container">
              <div v-if="activeTab === 'manifest.json'" class="code-block">
                <pre>{{ JSON.stringify(pluginStore.generatedManifest, null, 2) }}</pre>
              </div>
              <div v-if="activeTab === 'plugin.py'" class="code-block">
                <pre>{{ pluginStore.generatedPluginPy }}</pre>
              </div>
              <div v-if="activeTab === 'config.py'" class="code-block">
                <pre>{{ pluginStore.generatedConfigPy }}</pre>
              </div>
            </div>
          </div>
        </section>

        <!-- Export View -->
        <section v-if="currentView === 'export'" class="view">
          <h2>导出与同步</h2>
          <div class="card expressive">
            <div class="export-section">
              <h3>导出选项</h3>
              <div class="button-bar">
                <button class="btn-secondary expressive">导出为 ZIP</button>
                <button class="btn-secondary expressive">下载源码</button>
              </div>
            </div>

            <div class="git-section expressive">
              <h3>GitHub 同步</h3>
              <div v-if="!pluginStore.isGitConnected" class="button-bar">
                <button class="btn-primary expressive" @click="showGitModal = true">
                  连接 GitHub
                </button>
              </div>
              <div v-else class="git-connected">
                <p class="status-text">GitHub 已连接</p>
                <p class="commit-info">最后提交: {{ pluginStore.gitLastCommit?.slice(0, 7) || 'N/A' }}</p>
                <button class="btn-primary expressive" @click="syncToGithub" :disabled="pluginStore.gitSyncStatus === 'syncing'">
                  {{ pluginStore.gitSyncStatus === 'syncing' ? '同步中...' : '推送到 GitHub' }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- GitHub Connection Modal -->
    <div v-if="showGitModal" class="modal-overlay" @click.self="showGitModal = false">
      <div class="modal expressive">
        <h2>连接 GitHub</h2>
        <div class="modal-content">
          <div class="form-group">
            <label>仓库地址</label>
            <input 
              v-model="gitRepoUrl"
              type="text"
              class="input-field"
              placeholder="https://github.com/user/repo"
            />
          </div>
          <div class="form-group">
            <label>个人访问令牌 (PAT)</label>
            <input 
              v-model="gitToken"
              type="password"
              class="input-field"
              placeholder="ghp_..."
            />
            <p class="hint">在 GitHub Settings > Developer settings > Personal access tokens 创建</p>
          </div>
          <div class="button-bar modal-actions">
            <button class="btn-primary expressive" @click="connectGitHub">连接</button>
            <button class="btn-secondary expressive" @click="showGitModal = false">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import * as Blockly from 'blockly'
import '@/blocks'
import { usePluginProjectStore } from '@/stores/pluginProject'
import { ManifestBuilder } from '@/generator/manifestBuilder'
import { PluginBuilder } from '@/generator/pluginBuilder'
import { ConfigBuilder } from '@/generator/configBuilder'
import { gitSyncService } from '@/git/gitService'
import { gitHubAuthManager } from '@/git/githubAuth'

const pluginStore = usePluginProjectStore()
const blocklyDiv = ref<HTMLDivElement | null>(null)
let workspace: Blockly.Workspace | null = null

const navItems = [
  { id: 'project', label: '项目设置', icon: 'settings' },
  { id: 'blocks', label: '积木编辑', icon: 'widgets' },
  { id: 'components', label: '组件管理', icon: 'inventory_2' },
  { id: 'code', label: '代码预览', icon: 'code' },
  { id: 'export', label: '导出同步', icon: 'rocket_launch' },
]

const currentView = ref('project')
const selectedComponentType = ref('')
const newComponentName = ref('')
const showGitModal = ref(false)
const gitRepoUrl = ref('')
const gitToken = ref('')
const codeTabs = ['manifest.json', 'plugin.py', 'config.py']
const activeTab = ref('manifest.json')

const isDark = ref(
  localStorage.getItem('mofox-theme') === 'dark' ||
  (!localStorage.getItem('mofox-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
)

const applyTheme = (dark: boolean) => {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}
applyTheme(isDark.value)

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('mofox-theme', isDark.value ? 'dark' : 'light')
  applyTheme(isDark.value)
  // 如果当前在积木编辑页，重建 Blockly 以应用新主题
  if (currentView.value === 'blocks' && workspace && blocklyDiv.value) {
    const xml = Blockly.Xml.workspaceToDom(workspace as Blockly.WorkspaceSvg)
    savedBlocklyXml = Blockly.Xml.domToText(xml)
    workspace.dispose()
    workspace = Blockly.inject(blocklyDiv.value, getBlocklyOptions())
    if (savedBlocklyXml) {
      const dom = Blockly.utils.xml.textToDom(savedBlocklyXml)
      Blockly.Xml.domToWorkspace(dom, workspace as Blockly.WorkspaceSvg)
    }
  }
}

const darkBlocklyTheme = Blockly.Theme.defineTheme('mofox_dark', {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: '#1d2026',
    toolboxBackgroundColour: '#282a31',
    toolboxForegroundColour: '#c2c7d0',
    flyoutBackgroundColour: '#22252c',
    flyoutForegroundColour: '#c2c7d0',
    flyoutOpacity: 0.95,
    scrollbarColour: '#4a5060',
    scrollbarOpacity: 0.6,
  },
})

const getBlocklyOptions = (): Blockly.BlocklyOptions => ({
  toolbox: createToolbox(),
  grid: { spacing: 20, length: 3, colour: isDark.value ? '#333' : '#ccc', snap: true },
  trashcan: true,
  zoom: { controls: true, wheel: true, startScale: 1 },
  theme: isDark.value ? darkBlocklyTheme : Blockly.Themes.Classic,
})

let savedBlocklyXml: string | null = null

watch(currentView, (newView, oldView) => {
  // 离开积木编辑时保存状态并销毁
  if (oldView === 'blocks' && workspace) {
    const xml = Blockly.Xml.workspaceToDom(workspace as Blockly.WorkspaceSvg)
    savedBlocklyXml = Blockly.Xml.domToText(xml)
    workspace.dispose()
    workspace = null
  }
  // 进入积木编辑时重新注入
  if (newView === 'blocks') {
    nextTick(() => {
      if (blocklyDiv.value) {
        workspace = Blockly.inject(blocklyDiv.value, getBlocklyOptions())
        // 恢复之前的积木
        if (savedBlocklyXml) {
          const dom = Blockly.utils.xml.textToDom(savedBlocklyXml)
          Blockly.Xml.domToWorkspace(dom, workspace as Blockly.WorkspaceSvg)
        }
      }
    })
  }
})

const createToolbox = () => {
  return `
    <xml>
      <category name="插件" colour="#7C3AED">
        <block type="plugin_declare"></block>
        <block type="dependency_declare"></block>
      </category>
      <category name="组件" colour="#06B6D4">
        <label text="── 核心组件 ──"></label>
        <block type="component_action"></block>
        <block type="component_tool"></block>
        <block type="component_chatter"></block>
        <block type="component_service"></block>
        <label text="── 扩展组件 ──"></label>
        <block type="component_agent"></block>
        <block type="component_event_handler"></block>
        <block type="component_command"></block>
        <block type="component_adapter"></block>
        <block type="component_router"></block>
        <block type="component_config"></block>
      </category>
      <category name="参数与激活" colour="#F59E0B">
        <block type="param_define"></block>
        <block type="action_activation"></block>
        <block type="chat_type"></block>
      </category>
      <category name="配置" colour="#84CC16">
        <block type="config_section"></block>
        <block type="config_field"></block>
      </category>
      <category name="事件" colour="#F97316">
        <block type="event_subscribe"></block>
        <block type="event_publish"></block>
      </category>
      <category name="值" colour="#8B5CF6">
        <block type="text_mofox"></block>
        <block type="number_mofox"></block>
        <block type="bool_mofox"></block>
        <block type="python_code"></block>
      </category>
    </xml>
  `
}

const saveProject = () => {
  pluginStore.setProjectInfo(
    pluginStore.pluginName || 'default_plugin',
    pluginStore.pluginVersion || '1.0.0',
    pluginStore.pluginDescription || ''
  )
  alert('项目已保存！')
}

const addComponent = () => {
  if (!selectedComponentType.value || !newComponentName.value) {
    alert('请选择组件类型和输入名称')
    return
  }

  pluginStore.addComponent({
    type: selectedComponentType.value as any,
    name: newComponentName.value,
  })

  selectedComponentType.value = ''
  newComponentName.value = ''
}

const generateCode = async () => {
  const manifest = ManifestBuilder.generate(
    pluginStore.pluginName || 'default_plugin',
    pluginStore.pluginVersion || '1.0.0',
    pluginStore.components
  )

  const pluginPy = PluginBuilder.generate(
    pluginStore.pluginName || 'default_plugin',
    pluginStore.components
  )

  const configPy = ConfigBuilder.generate(
    pluginStore.pluginName || 'default_plugin',
    pluginStore.components
  )

  pluginStore.generatedManifest = manifest
  pluginStore.generatedPluginPy = pluginPy
  pluginStore.generatedConfigPy = configPy
  pluginStore.buildStatus = 'ready'

  currentView.value = 'code'
  console.log('代码生成完成')
}

const syncToGithub = async () => {
  if (!pluginStore.isGitConnected) {
    alert('请先连接 GitHub')
    return
  }

  await pluginStore.syncToGitHub()
  alert('推送完成')
}

const connectGitHub = async () => {
  if (!gitRepoUrl.value || !gitToken.value) {
    alert('请填写仓库地址和访问令牌')
    return
  }

  try {
    const isValid = await gitHubAuthManager.validatePAT(gitToken.value)
    if (!isValid) {
      alert('访问令牌无效')
      return
    }

    await gitSyncService.init(gitRepoUrl.value, gitToken.value)
    await pluginStore.connectGitHub(gitRepoUrl.value, gitToken.value)

    showGitModal.value = false
    alert('GitHub 连接成功')
  } catch (error) {
    alert('连接失败: ' + String(error))
  }
}
</script>

