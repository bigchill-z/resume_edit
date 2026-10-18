// 简历模板定义：切换模板只影响预览/导出的排版样式，不影响数据
export const TEMPLATES = [
  { key: "classic", name: "经典单栏" },
  { key: "sidebar", name: "左侧深色栏" },
  { key: "label", name: "简约标签" },
];

export const DEFAULT_TEMPLATE = "classic";

export function isValidTemplate(key) {
  return TEMPLATES.some((t) => t.key === key);
}

export function getTemplate(set) {
  const key = set && set.tplKey;
  return isValidTemplate(key) ? key : DEFAULT_TEMPLATE;
}

export function templateName(key) {
  const t = TEMPLATES.find((item) => item.key === key);
  return t ? t.name : DEFAULT_TEMPLATE;
}
