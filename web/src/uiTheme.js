// 软件界面风格（仅影响编辑器外观，不影响简历纸张与导出内容）
export const UI_THEMES = [
  { key: "saas", name: "清爽 SaaS" },
  { key: "classic", name: "经典深色" },
];

// 默认使用「清爽 SaaS」；用新 key 区分「用户显式选择」与旧版自动写入的默认值
export const DEFAULT_THEME = "saas";
const STORAGE_KEY = "resume_ui_theme_v2";
const LEGACY_KEY = "resume_ui_theme";

export function isValidTheme(key) {
  return UI_THEMES.some((t) => t.key === key);
}

export function getUiTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValidTheme(saved)) return saved;
    // 兼容旧 key：旧版只可能记录过「用户切换过的风格」或自动写入的 classic 默认值，
    // 其中只有 saas 能确定是用户主动选过的，classic 一律按新版默认处理。
    if (localStorage.getItem(LEGACY_KEY) === "saas") return "saas";
    return DEFAULT_THEME;
  } catch (e) {
    return DEFAULT_THEME;
  }
}

// 写入 <html data-ui-theme="..."> 并持久化，返回实际生效的风格 key
export function applyUiTheme(key) {
  const theme = isValidTheme(key) ? key : DEFAULT_THEME;
  document.documentElement.dataset.uiTheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
    localStorage.removeItem(LEGACY_KEY);
  } catch (e) {
    /* 隐私模式等环境忽略存储失败 */
  }
  return theme;
}
