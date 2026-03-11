<template>
  <div :class="['app-container', { dark: isDark }]">
    <header class="header">
      <div class="header-content">
        <div class="header-top">
          <div>
            <h1>MoFox 插件生成器</h1>
            <p class="subtitle">Neo-MoFox 可视化插件构建平台</p>
          </div>
          <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换浅色' : '切换深色'">
            <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
          </button>
        </div>
      </div>
    </header>

    <div class="body-layout">
      <!-- Left Navigation -->
      <nav class="sidebar">
        <div class="nav-title">导航</div>
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.id" 
              :class="['nav-item', { active: currentView === item.id }]"
              @click="currentView = item.id">
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
  { id: 'project', label: '项目设置' },
  { id: 'blocks', label: '积木编辑' },
  { id: 'components', label: '组件管理' },
  { id: 'code', label: '代码预览' },
  { id: 'export', label: '导出同步' },
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
      </category>
      <category name="组件" colour="#06B6D4">
        <block type="component_action"></block>
        <block type="component_tool"></block>
        <block type="component_service"></block>
      </category>
      <category name="事件" colour="#F97316">
        <block type="event_subscribe"></block>
        <block type="event_publish"></block>
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

<style scoped>
.app-container {
  --shell-border: rgba(66, 71, 79, 0.2);
  --shell-shadow: 0 10px 28px rgba(15, 52, 107, 0.08);
  --radius-xl: 24px;
  --radius-lg: 18px;

  --c-bg-app: linear-gradient(170deg, #f9fbff 0%, #f1f5ff 100%);
  --c-bg-app-radial1: rgba(0, 90, 193, 0.14);
  --c-bg-app-radial2: rgba(124, 74, 145, 0.12);
  --c-header-title: #07234d;
  --c-subtitle: #39495f;
  --c-sidebar-bg: rgba(251, 248, 255, 0.82);
  --c-nav-title: #4a5463;
  --c-nav-item: #29384f;
  --c-nav-hover-bg: rgba(0, 90, 193, 0.1);
  --c-nav-active-bg: linear-gradient(145deg, #d8e2ff 0%, #e0ddff 100%);
  --c-nav-active-text: #001b44;
  --c-nav-active-ring: rgba(0, 90, 193, 0.25);
  --c-heading: #0d2752;
  --c-card-bg: rgba(251, 248, 255, 0.9);
  --c-card-expressive: linear-gradient(180deg, rgba(216, 226, 255, 0.34) 0%, rgba(251, 248, 255, 0.95) 42%, rgba(245, 233, 255, 0.52) 100%);
  --c-card-expressive-base: rgba(251, 248, 255, 0.95);
  --c-card-hover-shadow: 0 14px 30px rgba(15, 52, 107, 0.12);
  --c-label: #1d2f4a;
  --c-input-border: #8c919a;
  --c-input-text: #1c1f24;
  --c-input-bg: #ffffff;
  --c-input-focus-ring: rgba(0, 90, 193, 0.22);
  --c-btn-primary-bg: linear-gradient(135deg, #005ac1 0%, #274dbf 100%);
  --c-btn-primary-hover: linear-gradient(135deg, #014da6 0%, #2444a7 100%);
  --c-btn-primary-shadow: 0 6px 18px rgba(0, 90, 193, 0.35);
  --c-btn-primary-shadow-hover: 0 10px 22px rgba(0, 90, 193, 0.38);
  --c-btn-secondary-bg: #ffffff;
  --c-btn-secondary-text: #16315e;
  --c-btn-secondary-border: rgba(0, 90, 193, 0.42);
  --c-btn-secondary-shadow: 0 3px 12px rgba(0, 90, 193, 0.12);
  --c-btn-secondary-hover-bg: #ecf2ff;
  --c-btn-secondary-hover-border: rgba(0, 90, 193, 0.68);
  --c-btn-secondary-exp-bg: linear-gradient(130deg, #ffffff 0%, #f0edff 100%);
  --c-btn-secondary-exp-hover: linear-gradient(130deg, #ebf2ff 0%, #eeeaff 100%);
  --c-btn-small-text: #8f1016;
  --c-btn-small-hover-bg: #ffe9ea;
  --c-btn-small-hover-border: #f0b9be;
  --c-blockly-bg: #f7f9ff;
  --c-empty-text: #475469;
  --c-empty-hint: #65758f;
  --c-comp-bg: #fdfcff;
  --c-comp-border-left: #005ac1;
  --c-comp-hover-border-left: #7c4a91;
  --c-comp-shadow: 0 5px 14px rgba(15, 52, 107, 0.1);
  --c-comp-hover-shadow: 0 10px 20px rgba(15, 52, 107, 0.15);
  --c-badge-bg: #d8e2ff;
  --c-badge-text: #00275f;
  --c-comp-name: #1d2f4a;
  --c-add-section-bg: linear-gradient(140deg, transparent 0%, rgba(0, 90, 193, 0.05) 100%);
  --c-section-h3: #17315f;
  --c-tabs-bg: #edf2ff;
  --c-tab-text: #43526a;
  --c-tab-hover-text: #123469;
  --c-tab-hover-bg: rgba(0, 90, 193, 0.08);
  --c-tab-active-text: #0c2d62;
  --c-tab-active-bg: rgba(0, 90, 193, 0.12);
  --c-code-bg: linear-gradient(135deg, #0e1e38 0%, #1a315c 100%);
  --c-code-border: #2f4775;
  --c-code-text: #e2e8f0;
  --c-export-border: var(--shell-border);
  --c-export-h3: #19325f;
  --c-git-connected-bg: linear-gradient(135deg, #edf2ff 0%, #f1ebff 100%);
  --c-git-connected-border: rgba(0, 90, 193, 0.3);
  --c-status-text: #15407b;
  --c-commit-info: #334f7a;
  --c-hint: #576780;
  --c-modal-overlay: rgba(7, 19, 39, 0.46);
  --c-modal-bg: linear-gradient(135deg, #fbf8ff 0%, #f2f5ff 100%);
  --c-modal-shadow: 0 20px 52px rgba(12, 40, 86, 0.24);
  --c-modal-border: rgba(0, 90, 193, 0.22);
  --c-modal-title-from: #005ac1;
  --c-modal-title-to: #7c4a91;

  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background:
    radial-gradient(1200px 560px at -5% -15%, var(--c-bg-app-radial1), transparent 58%),
    radial-gradient(700px 420px at 100% 0%, var(--c-bg-app-radial2), transparent 52%),
    var(--c-bg-app);
  color: var(--md-sys-color-on-background);
}

/* ══════ dark overrides ══════ */
.app-container.dark {
  --shell-border: rgba(200, 210, 230, 0.12);
  --shell-shadow: 0 10px 28px rgba(0, 0, 0, 0.32);

  --c-bg-app: linear-gradient(170deg, #111318 0%, #161a24 100%);
  --c-bg-app-radial1: rgba(80, 140, 255, 0.08);
  --c-bg-app-radial2: rgba(180, 100, 220, 0.06);
  --c-header-title: #d6dfef;
  --c-subtitle: #97a4b8;
  --c-sidebar-bg: rgba(29, 32, 38, 0.85);
  --c-nav-title: #8a94a6;
  --c-nav-item: #bcc5d6;
  --c-nav-hover-bg: rgba(173, 198, 255, 0.1);
  --c-nav-active-bg: linear-gradient(145deg, #1e2d4a 0%, #2a2440 100%);
  --c-nav-active-text: #d0dcf8;
  --c-nav-active-ring: rgba(173, 198, 255, 0.25);
  --c-heading: #c4d1ea;
  --c-card-bg: rgba(29, 32, 38, 0.85);
  --c-card-expressive: linear-gradient(180deg, rgba(40, 52, 80, 0.6) 0%, rgba(29, 32, 38, 0.95) 42%, rgba(55, 35, 70, 0.3) 100%);
  --c-card-expressive-base: rgba(29, 32, 38, 0.95);
  --c-card-hover-shadow: 0 14px 30px rgba(0, 0, 0, 0.38);
  --c-label: #b8c5da;
  --c-input-border: #4a5060;
  --c-input-text: #e2e5ec;
  --c-input-bg: #1d2026;
  --c-input-focus-ring: rgba(173, 198, 255, 0.25);
  --c-btn-primary-bg: linear-gradient(135deg, #3a7af0 0%, #5e6dea 100%);
  --c-btn-primary-hover: linear-gradient(135deg, #4a88f5 0%, #6e7cf0 100%);
  --c-btn-primary-shadow: 0 6px 18px rgba(58, 122, 240, 0.3);
  --c-btn-primary-shadow-hover: 0 10px 22px rgba(58, 122, 240, 0.38);
  --c-btn-secondary-bg: #1d2026;
  --c-btn-secondary-text: #b8c8e8;
  --c-btn-secondary-border: rgba(173, 198, 255, 0.3);
  --c-btn-secondary-shadow: 0 3px 12px rgba(0, 0, 0, 0.2);
  --c-btn-secondary-hover-bg: #252a34;
  --c-btn-secondary-hover-border: rgba(173, 198, 255, 0.5);
  --c-btn-secondary-exp-bg: linear-gradient(130deg, #1d2026 0%, #24213a 100%);
  --c-btn-secondary-exp-hover: linear-gradient(130deg, #252a34 0%, #2d2a44 100%);
  --c-btn-small-text: #ffb4ab;
  --c-btn-small-hover-bg: rgba(255, 180, 171, 0.12);
  --c-btn-small-hover-border: rgba(255, 180, 171, 0.3);
  --c-blockly-bg: #191c22;
  --c-empty-text: #8a94a6;
  --c-empty-hint: #6a7588;
  --c-comp-bg: #1d2026;
  --c-comp-border-left: #7cacff;
  --c-comp-hover-border-left: #c893e0;
  --c-comp-shadow: 0 5px 14px rgba(0, 0, 0, 0.24);
  --c-comp-hover-shadow: 0 10px 20px rgba(0, 0, 0, 0.32);
  --c-badge-bg: #002e6c;
  --c-badge-text: #d0dcf8;
  --c-comp-name: #c0cddd;
  --c-add-section-bg: linear-gradient(140deg, transparent 0%, rgba(173, 198, 255, 0.04) 100%);
  --c-section-h3: #adbdd5;
  --c-tabs-bg: #1a1e28;
  --c-tab-text: #8a94a6;
  --c-tab-hover-text: #c6d2ea;
  --c-tab-hover-bg: rgba(173, 198, 255, 0.08);
  --c-tab-active-text: #d0dcf8;
  --c-tab-active-bg: rgba(173, 198, 255, 0.14);
  --c-code-bg: linear-gradient(135deg, #0c1220 0%, #121c30 100%);
  --c-code-border: #263050;
  --c-code-text: #d0daf0;
  --c-export-h3: #adbdd5;
  --c-git-connected-bg: linear-gradient(135deg, #1a2436 0%, #211e34 100%);
  --c-git-connected-border: rgba(173, 198, 255, 0.2);
  --c-status-text: #93b4e8;
  --c-commit-info: #7a96bf;
  --c-hint: #6a7588;
  --c-modal-overlay: rgba(0, 0, 0, 0.6);
  --c-modal-bg: linear-gradient(135deg, #1d2026 0%, #1a1e2c 100%);
  --c-modal-shadow: 0 20px 52px rgba(0, 0, 0, 0.5);
  --c-modal-border: rgba(173, 198, 255, 0.18);
  --c-modal-title-from: #8cb8ff;
  --c-modal-title-to: #d097f0;
}

/* ══════ Theme toggle button ══════ */
.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1.5px solid var(--shell-border);
  background: var(--c-card-bg);
  cursor: pointer;
  transition: all 0.22s var(--md-sys-motion-standard);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  margin-top: 4px;
}

.theme-toggle:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
}

.theme-icon {
  font-size: 20px;
  line-height: 1;
}

.header {
  padding: 28px 32px 20px;
  border-bottom: 1px solid var(--shell-border);
}

.header-content h1 {
  margin-bottom: 8px;
  font-size: clamp(2rem, 2.8vw, 2.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0.01em;
  color: var(--c-header-title);
}

.subtitle {
  font-size: 15px;
  color: var(--c-subtitle);
  font-weight: 500;
}

.body-layout {
  display: flex;
  flex: 1;
  gap: 20px;
  overflow: auto;
  padding: 12px 18px 20px;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--c-sidebar-bg);
  border: 1px solid var(--shell-border);
  overflow-y: auto;
  padding: 18px 10px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shell-shadow);
}

.nav-title {
  padding: 10px 14px;
  font-weight: 700;
  color: var(--c-nav-title);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  padding: 12px 16px;
  margin: 5px 8px;
  cursor: pointer;
  color: var(--c-nav-item);
  border-radius: 16px;
  transition: all 0.24s var(--md-sys-motion-standard);
  font-size: 15px;
  font-weight: 500;
  user-select: none;
}

.nav-item:hover {
  background: var(--c-nav-hover-bg);
  transform: translateX(3px);
}

.nav-item.active {
  background: var(--c-nav-active-bg);
  color: var(--c-nav-active-text);
  font-weight: 700;
  box-shadow: inset 0 0 0 1px var(--c-nav-active-ring);
}

.main-content {
  flex: 1;
  min-width: 0;
  padding: 16px 10px 24px;
}

.view {
  max-width: 1400px;
  margin: 0 auto;
}

.view h2 {
  margin-bottom: 20px;
  font-size: clamp(1.7rem, 2.4vw, 2.1rem);
  font-weight: 700;
  color: var(--c-heading);
  letter-spacing: 0.01em;
}

.card,
.form-card {
  background: var(--c-card-bg);
  border-radius: var(--radius-xl);
  padding: 28px;
  margin-bottom: 20px;
  border: 1px solid var(--shell-border);
  box-shadow: var(--shell-shadow);
  transition: transform 0.22s var(--md-sys-motion-standard), box-shadow 0.22s var(--md-sys-motion-standard);
}

.card.expressive,
.form-card.expressive {
  background:
    var(--c-card-expressive),
    var(--c-card-expressive-base);
}

.card:hover,
.form-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--c-card-hover-shadow);
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--c-label);
  font-size: 14px;
  letter-spacing: 0.01em;
}

.input-field {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--c-input-border);
  border-radius: 14px;
  font-size: 14px;
  color: var(--c-input-text);
  background: var(--c-input-bg);
  transition: border-color 0.2s var(--md-sys-motion-standard), box-shadow 0.2s var(--md-sys-motion-standard);
}

.input-field:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 4px var(--c-input-focus-ring);
}

textarea.input-field {
  resize: vertical;
  min-height: 120px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
}

.button-bar {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.button-bar.modal-actions {
  margin-top: 24px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  min-height: 44px;
  padding: 10px 22px;
  border: none;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s var(--md-sys-motion-standard), box-shadow 0.2s var(--md-sys-motion-standard), background-color 0.2s var(--md-sys-motion-standard), color 0.2s var(--md-sys-motion-standard);
  font-size: 14px;
  letter-spacing: 0.01em;
}

.btn-primary {
  background: var(--c-btn-primary-bg);
  color: var(--md-sys-color-on-primary);
  box-shadow: var(--c-btn-primary-shadow);
}

.btn-primary:hover:not(:disabled) {
  background: var(--c-btn-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--c-btn-primary-shadow-hover);
}

.btn-primary.expressive {
  background: var(--c-btn-primary-bg);
}

.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary {
  background: var(--c-btn-secondary-bg);
  color: var(--c-btn-secondary-text);
  border: 1.5px solid var(--c-btn-secondary-border);
  box-shadow: var(--c-btn-secondary-shadow);
}

.btn-secondary:hover {
  background: var(--c-btn-secondary-hover-bg);
  border-color: var(--c-btn-secondary-hover-border);
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 90, 193, 0.2);
}

.btn-secondary.expressive {
  background: var(--c-btn-secondary-exp-bg);
}

.btn-secondary.expressive:hover {
  background: var(--c-btn-secondary-exp-hover);
}

.btn-small {
  padding: 6px 12px;
  background: transparent;
  color: var(--c-btn-small-text);
  border: 1px solid transparent;
  font-size: 12px;
  border-radius: 999px;
  font-weight: 600;
  transition: all 0.2s var(--md-sys-motion-standard);
}

.btn-small:hover {
  background: var(--c-btn-small-hover-bg);
  border-color: var(--c-btn-small-hover-border);
}

.blockly-container {
  width: 100%;
  height: 620px;
  border: 1px solid var(--shell-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--c-blockly-bg);
}

.comp-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
  min-height: 120px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 24px;
  color: var(--c-empty-text);
}

.empty-state p {
  margin: 0;
  font-size: 15px;
}

.empty-state .hint {
  font-size: 13px;
  color: var(--c-empty-hint);
  margin-top: 4px;
}

.comp-item {
  padding: 16px;
  background: var(--c-comp-bg);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 4px solid var(--c-comp-border-left);
  transition: all 0.2s var(--md-sys-motion-standard);
}

.comp-item.expressive {
  box-shadow: var(--c-comp-shadow);
}

.comp-item:hover {
  transform: translateY(-2px);
  border-left-color: var(--c-comp-hover-border-left);
  box-shadow: var(--c-comp-hover-shadow);
}

.comp-badge {
  padding: 6px 12px;
  background: var(--c-badge-bg);
  color: var(--c-badge-text);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 60px;
  text-align: center;
}

.comp-name {
  flex: 1;
  color: var(--c-comp-name);
  font-weight: 600;
  font-size: 14px;
}

.add-comp-section {
  border-top: 1px solid var(--shell-border);
  padding-top: 28px;
  background: var(--c-add-section-bg);
  border-radius: 14px;
  padding-left: 28px;
  padding-right: 28px;
  padding-bottom: 28px;
  margin-left: -28px;
  margin-right: -28px;
  margin-bottom: -28px;
}

.add-comp-section.expressive {
  box-shadow: inset 0 4px 12px rgba(0, 90, 193, 0.05);
}

.add-comp-section h3 {
  margin: 0 0 18px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--c-section-h3);
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--shell-border);
  margin-bottom: 20px;
  background: var(--c-tabs-bg);
  border-radius: 12px 12px 0 0;
  overflow: auto;
}

.tab-btn {
  padding: 14px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  color: var(--c-tab-text);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s var(--md-sys-motion-standard);
  white-space: nowrap;
  margin: 0;
}

.tab-btn:hover {
  color: var(--c-tab-hover-text);
  background: var(--c-tab-hover-bg);
}

.tab-btn.active {
  color: var(--c-tab-active-text);
  border-bottom-color: var(--md-sys-color-primary);
  background: var(--c-tab-active-bg);
}

.code-container {
  background: var(--c-code-bg);
  border: 1px solid var(--c-code-border);
  border-radius: 12px;
  overflow: auto;
  box-shadow: inset 0 4px 14px rgba(0, 0, 0, 0.26);
}

.code-block {
  padding: 20px;
}

.code-block pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  font-size: 13px;
  color: var(--c-code-text);
  line-height: 1.7;
  overflow-x: auto;
  letter-spacing: 0.3px;
}

.export-section,
.git-section {
  padding: 20px 0;
  border-bottom: 1px solid var(--shell-border);
}

.export-section:last-child,
.git-section:last-child {
  border-bottom: none;
}

.export-section h3,
.git-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--c-export-h3);
}

.git-connected {
  padding: 16px;
  background: var(--c-git-connected-bg);
  border: 1px solid var(--c-git-connected-border);
  border-radius: 12px;
  margin-bottom: 16px;
}

.status-text {
  margin: 0 0 4px 0;
  font-weight: 600;
  color: var(--c-status-text);
  font-size: 14px;
}

.commit-info {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--c-commit-info);
}

.hint {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: var(--c-hint);
  font-weight: 400;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--c-modal-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.22s var(--md-sys-motion-standard);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(4px);
  }
}

.modal {
  background: var(--c-modal-bg);
  border-radius: var(--radius-xl);
  padding: 32px;
  max-width: 540px;
  width: 90%;
  box-shadow: var(--c-modal-shadow);
  border: 1px solid var(--c-modal-border);
  animation: slideUp 0.24s var(--md-sys-motion-standard);
}

.modal.expressive {
  box-shadow: 0 22px 54px rgba(12, 40, 86, 0.28);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal h2 {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--c-modal-title-from) 0%, var(--c-modal-title-to) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-content {
  padding: 0;
}

@media (max-width: 960px) {
  .body-layout {
    flex-direction: column;
    padding: 10px;
  }

  .sidebar {
    width: 100%;
    padding: 12px 8px;
  }

  .nav-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .nav-item {
    margin: 0;
    text-align: center;
    justify-content: center;
  }

  .main-content {
    padding: 8px 2px 16px;
  }

  .card,
  .form-card {
    padding: 18px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .blockly-container {
    height: 460px;
  }
}

@media (max-width: 640px) {
  .header {
    padding: 20px 16px 14px;
  }

  .view h2 {
    font-size: 1.5rem;
  }

  .nav-list {
    grid-template-columns: 1fr;
  }

  .comp-list {
    grid-template-columns: 1fr;
  }

  .button-bar {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>

