import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import '@wangeditor/editor/dist/css/style.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import { applyUiTheme, getUiTheme } from './uiTheme'

// 挂载前先应用上次选择的界面风格，避免首屏闪一下默认风格
applyUiTheme(getUiTheme())

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus, { locale: zhCn })
app.mount('#app')
