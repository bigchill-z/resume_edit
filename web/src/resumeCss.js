// 预览与导出共用同一份 CSS：由 setData 动态生成，注入 <style> 供页面预览，
// 同时作为 cssStr 传给后端导出接口。
import { getTemplate } from "./templates";

export const FONT_MAP = {
  1: "'Microsoft YaHei','PingFang SC','Hiragino Sans GB','Source Han Sans SC',sans-serif",
  2: "Georgia,'Times New Roman','SimSun',serif",
  3: "Helvetica,Arial,'Microsoft YaHei',sans-serif",
  4: "Monaco,'Courier New',monospace",
};

export const SKIN_COLORS = [
  "#333333",
  "#1575bf",
  "#008a00",
  "#e60000",
  "#39394d",
  "#0eaa83",
  "#f56c6c",
  "#667085",
  "#d48806",
  "#7b5ce1",
];

// 把主题色向白色混合，得到浅色块颜色（标题颜色设置变化时，浅色标题条同步变化）
function mixWithWhite(hex, ratio) {
  const m = /^#?([a-f\d]{3}|[a-f\d]{6})$/i.exec(String(hex || "").trim());
  if (!m) return "#f2f3f5";
  let h = m[1];
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  const mix = (c) => Math.round(c + (255 - c) * ratio);
  return (
    "#" +
    [mix(n >> 16), mix((n >> 8) & 255), mix(n & 255)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function buildClassicCss(set) {
  const skin = set.skin || "#333333";
  const fontFamily = FONT_MAP[set.font] || FONT_MAP[1];
  const fontSize = set.fontSize || 13;
  const titleSize = set.titleFontSize ?? fontSize + 3;
  const lineHeight = set.lineHeight || 1.7;
  const mm = set.mm ?? 25;
  const pp = set.pp ?? 30;
  // 模块标题与横线间距 / 横线与下方内容间距 / 子模块间距
  const titleGap = set.titleGap ?? 6;
  const lineGap = set.lineGap ?? 10;
  const itemGap = set.itemGap ?? 10;
  return `
#resume_pc { box-sizing: border-box; width: 794px; min-height: 1123px; margin: 0 auto; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.18); padding: ${pp}px; font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; color: #333; }
#resume_pc * { box-sizing: border-box; }
#resume_pc p { margin: 0; }
#resume_pc ul, #resume_pc ol { margin: 0; padding-left: 20px; }
/* 富文本内容中的列表：恢复圆点/数字符号（页面全局有 list-style:none 重置） */
#resume_pc .r-content ul { list-style: disc; }
#resume_pc .r-content ol { list-style: decimal; }
#resume_pc .r-content ul ul { list-style: circle; }
#resume_pc .r-content ul ul ul { list-style: square; }
#resume_pc .r-content li { list-style: inherit; }
#resume_pc img { max-width: 100%; }

/* 封面页 */
#resume_pc .r-cover { padding-bottom: 18px; margin-bottom: 18px; border-bottom: 2px dashed ${skin}; }
#resume_pc .r-cover-name { font-size: 30px; font-weight: bold; color: ${skin}; letter-spacing: 4px; }
#resume_pc .r-cover-job { margin-top: 6px; font-size: 15px; color: #666; }
#resume_pc .r-cover-info { margin-top: 10px; }
#resume_pc .r-cover-info li { font-size: 13px; color: #444; line-height: 1.9; list-style: none; }

/* 简历标题（标题设置开启时显示） */
#resume_pc .r-head { text-align: center; margin-bottom: 16px; }
#resume_pc .r-title { font-size: ${titleSize + 10}px; font-weight: bold; color: ${skin}; letter-spacing: 6px; }
#resume_pc .r-slogan { font-size: 13px; color: ${skin}; margin-top: 4px; letter-spacing: 1px; }

/* 基本信息：姓名居中大标题 + 照片右上 */
#resume_pc .r-basic { position: relative; text-align: center; padding-bottom: 18px; }
/* 显示照片时，信息区右侧让出照片位置（对齐原站：隐藏照片则整宽居中） */
#resume_pc .r-basic.has-photo { padding-right: 100px; }
#resume_pc .r-photo { position: absolute; right: 6px; top: 10px; width: 88px; height: 118px; object-fit: cover; border-radius: 2px; }
#resume_pc .r-name { font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #222; }
#resume_pc .r-intention { margin-top: 10px; color: #333; }
#resume_pc .r-intention b { font-weight: 400; }
#resume_pc .r-info-line { margin-top: 6px; display: flex; justify-content: center; flex-wrap: wrap; }
#resume_pc .r-info-item { position: relative; padding: 0 14px; }
#resume_pc .r-info-item + .r-info-item::before { content: ""; position: absolute; left: 0; top: 50%; transform: translateY(-50%); height: 12px; border-left: 1px solid #aaa; }

/* 模块 */
#resume_pc .r-module { margin-bottom: ${mm}px; }
#resume_pc .r-module:last-child { margin-bottom: 0; }
#resume_pc .r-module-title { font-size: ${titleSize}px; font-weight: bold; color: ${skin}; border-bottom: 1px solid ${skin}; padding-bottom: ${titleGap}px; margin-bottom: ${lineGap}px; letter-spacing: 1px; }

/* 条目：名称在左，时间右对齐 */
#resume_pc .r-item { margin-bottom: ${itemGap}px; }
#resume_pc .r-item:last-child { margin-bottom: 0; }
#resume_pc .r-item-head { display: flex; justify-content: space-between; align-items: baseline; }
#resume_pc .r-item-name { font-weight: bold; min-width: 0; }
#resume_pc .r-time { flex-shrink: 0; margin-left: 16px; color: #555; font-weight: 400; }
#resume_pc .r-content { margin-top: 3px; color: #444; }

/* 技能特长：一行 3 个掌握程度 */
#resume_pc .r-skills { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 4px; }
#resume_pc .r-skill { display: flex; align-items: center; width: calc((100% - 36px) / 3); margin: 0; }
#resume_pc .r-skill-name { width: 104px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#resume_pc .r-skill-bar { flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; margin-right: 6px; }
#resume_pc .r-skill-bar i { display: block; height: 100%; background: ${skin}; border-radius: 4px; }
#resume_pc .r-skill-val { width: 28px; flex-shrink: 0; text-align: right; color: ${skin}; }

/* 报考信息 */
#resume_pc .r-baokao-head { font-weight: bold; margin-bottom: 4px; }
#resume_pc .r-baokao-scores { display: flex; flex-wrap: wrap; }
#resume_pc .r-baokao-score { margin-right: 24px; }
#resume_pc .r-baokao-score b { color: ${skin}; }
`;
}

// 按 setData.tplKey 选择模板样式：预览与导出共用
export function buildResumeCss(set) {
  const s = set || {};
  const tpl = getTemplate(s);
  if (tpl === "sidebar") return buildSidebarCss(s);
  if (tpl === "label") return buildLabelCss(s);
  return buildClassicCss(s);
}

// 简约标签模板（参考：居中标题 + 基本信息表 + 带底色方块标签的模块标题）
function buildLabelCss(set) {
  const skin = set.skin || "#333333";
  const fontFamily = FONT_MAP[set.font] || FONT_MAP[1];
  const fontSize = set.fontSize || 13;
  const titleSize = set.titleFontSize ?? fontSize + 2;
  const lineHeight = set.lineHeight || 1.7;
  const mm = set.mm ?? 25;
  const titleGap = set.titleGap ?? 6;
  const lineGap = set.lineGap ?? 10;
  const itemGap = set.itemGap ?? 10;
  // 标题右侧浅色方块：由主题色（标题颜色）向白色混合得到
  const lightSkin = mixWithWhite(skin, 0.88);
  return `
#resume_pc.tpl-label { box-sizing: border-box; width: 794px; min-height: 1123px; margin: 0 auto; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.18); padding: 0; font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; color: #333; }
#resume_pc.tpl-label * { box-sizing: border-box; }
#resume_pc.tpl-label p { margin: 0; }
#resume_pc.tpl-label ul, #resume_pc.tpl-label ol { margin: 0; padding-left: 20px; }
#resume_pc.tpl-label img { max-width: 100%; }

/* 顶部标题 */
#resume_pc.tpl-label .r-label-head { padding: 26px 30px 8px; text-align: center; }
#resume_pc.tpl-label .r-label-head dt { font-size: ${titleSize + 11}px; font-weight: bold; letter-spacing: 4px; color: ${skin}; }
#resume_pc.tpl-label .r-label-head dd { margin: 6px 0 0; font-size: ${fontSize}px; color: #666; letter-spacing: 1px; }

#resume_pc.tpl-label .r-label-content { margin: 0 30px 20px; }
#resume_pc.tpl-label .r-label-module { margin-top: ${mm}px; }
#resume_pc.tpl-label .r-label-module:first-child { margin-top: 10px; }
#resume_pc.tpl-label .r-label-title { display: flex; align-items: stretch; margin-bottom: ${lineGap}px; padding-bottom: ${titleGap}px; }
#resume_pc.tpl-label .r-label-title b { display: inline-flex; align-items: center; padding: 4px 12px; color: #fff; background-color: ${skin}; font-size: ${titleSize}px; font-weight: bold; letter-spacing: 1px; border-radius: 2px 0 0 2px; }
/* 标题右侧浅色方块紧贴标题并占满该行剩余空间 */
#resume_pc.tpl-label .r-label-title::after { content: ""; flex: 1; min-width: 0; border-radius: 0 2px 2px 0; background-color: ${lightSkin}; }

/* 基本信息表 */
#resume_pc.tpl-label .r-label-basic-body { position: relative; padding-right: 120px; }
#resume_pc.tpl-label .r-label-info { margin: 0; padding: 0; }
#resume_pc.tpl-label .r-label-info dd { margin: 0; font-size: ${fontSize + 1}px; line-height: 24px; color: #333; }
#resume_pc.tpl-label .r-label-key { display: inline-block; width: 5.4em; letter-spacing: 0.28em; color: #333; }
#resume_pc.tpl-label .r-label-photo { position: absolute; right: 8px; top: 0; width: 90px; height: 120px; overflow: hidden; }
#resume_pc.tpl-label .r-label-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }

/* 求职意向 */
#resume_pc.tpl-label .r-label-yixiang { display: flex; flex-wrap: wrap; gap: 6px 26px; margin: 0; padding: 0; list-style: none; font-size: ${fontSize + 1}px; color: #333; }
#resume_pc.tpl-label .r-label-yixiang li { list-style: none; }

/* 条目数组 */
#resume_pc.tpl-label .r-label-item { margin-bottom: ${itemGap}px; }
#resume_pc.tpl-label .r-label-item:last-child { margin-bottom: 0; }
#resume_pc.tpl-label .r-label-item-top { display: flex; align-items: baseline; gap: 14px; margin: 0; padding: 0; list-style: none; font-size: ${fontSize}px; color: #333; }
#resume_pc.tpl-label .r-label-item-top li { list-style: none; }
#resume_pc.tpl-label .r-label-time { flex: 0 0 auto; color: #555; }
#resume_pc.tpl-label .r-label-name { font-weight: bold; }
#resume_pc.tpl-label .r-label-sub { color: #333; }
#resume_pc.tpl-label .r-label-content-text { margin-top: 5px; font-size: ${fontSize}px; line-height: ${lineHeight}; color: #444; }
#resume_pc.tpl-label .r-label-content-text ul { list-style: disc; }
#resume_pc.tpl-label .r-label-content-text ol { list-style: decimal; }
#resume_pc.tpl-label .r-label-content-text ul ul { list-style: circle; }
#resume_pc.tpl-label .r-label-content-text li { list-style: inherit; }

/* 技能特长：一行 3 个掌握程度 */
#resume_pc.tpl-label .r-label-skills { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 10px; }
#resume_pc.tpl-label .r-label-skill { width: calc((100% - 44px) / 3); margin-top: 4px; }
#resume_pc.tpl-label .r-label-skill:first-child { margin-top: 4px; }
#resume_pc.tpl-label .r-label-skill-bar { height: 6px; background: #ebeeF5; border-radius: 3px; overflow: hidden; }
#resume_pc.tpl-label .r-label-skill-bar i { display: block; height: 100%; background: ${skin}; border-radius: 3px; }
#resume_pc.tpl-label .r-label-skill-meta { display: flex; justify-content: space-between; gap: 6px; margin-top: 4px; }
#resume_pc.tpl-label .r-label-skill-name { font-size: ${fontSize}px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#resume_pc.tpl-label .r-label-skill-deg { flex: 0 0 auto; font-size: ${fontSize - 1}px; color: #606266; }

/* 报考信息 */
#resume_pc.tpl-label .r-baokao-head { font-weight: bold; margin-bottom: 4px; }
#resume_pc.tpl-label .r-baokao-scores { display: flex; flex-wrap: wrap; }
#resume_pc.tpl-label .r-baokao-score { margin-right: 24px; }
#resume_pc.tpl-label .r-baokao-score b { color: ${skin}; }

/* 紧凑模式：自动适配 1 页时启用（压缩固定留白，不影响其他模板） */
#resume_pc.tpl-label.compact .r-label-head { padding: 10px 30px 2px; }
#resume_pc.tpl-label.compact .r-label-head dt { font-size: ${titleSize + 5}px; }
#resume_pc.tpl-label.compact .r-label-head dd { margin-top: 2px; font-size: ${fontSize - 1}px; }
#resume_pc.tpl-label.compact .r-label-content { margin-bottom: 6px; }
#resume_pc.tpl-label.compact .r-label-info dd { font-size: ${fontSize}px; line-height: 18px; }
#resume_pc.tpl-label.compact .r-label-title { padding-bottom: 1px; margin-bottom: 3px; }
#resume_pc.tpl-label.compact .r-label-title b { padding: 1px 8px; font-size: ${Math.max(12, titleSize - 1)}px; }
#resume_pc.tpl-label.compact .r-label-module:first-child { margin-top: 4px; }
#resume_pc.tpl-label.compact .r-label-content-text { margin-top: 2px; }
#resume_pc.tpl-label.compact .r-label-skills { margin-top: 6px; gap: 6px 18px; }
#resume_pc.tpl-label.compact .r-label-skill { margin-top: 2px; }
#resume_pc.tpl-label.compact .r-label-skill-meta { margin-top: 1px; }
`;
}

// 左侧深色栏模板（参考：左栏深色个人信息+技能，右栏主内容）
function buildSidebarCss(set) {
  const skin = set.skin || "#333333";
  const fontFamily = FONT_MAP[set.font] || FONT_MAP[1];
  const fontSize = set.fontSize || 13;
  const titleSize = set.titleFontSize ?? fontSize + 3;
  const lineHeight = set.lineHeight || 1.7;
  const mm = set.mm ?? 25;
  const titleGap = set.titleGap ?? 6;
  const lineGap = set.lineGap ?? 10;
  const itemGap = set.itemGap ?? 10;
  return `
#resume_pc.tpl-sidebar { box-sizing: border-box; display: flex; align-items: stretch; width: 794px; min-height: 1123px; margin: 0 auto; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.18); padding: 0; font-family: ${fontFamily}; font-size: ${fontSize}px; line-height: ${lineHeight}; color: #333; overflow: hidden; }
#resume_pc.tpl-sidebar * { box-sizing: border-box; }
#resume_pc.tpl-sidebar p { margin: 0; }
#resume_pc.tpl-sidebar ul, #resume_pc.tpl-sidebar ol { margin: 0; padding-left: 20px; }
#resume_pc.tpl-sidebar img { max-width: 100%; }

/* 左侧深色栏 */
#resume_pc.tpl-sidebar .r-side { flex: 0 0 235px; width: 235px; padding: 26px 20px 30px; background-color: ${skin}; color: rgba(255,255,255,.9); }
#resume_pc.tpl-sidebar .r-side-photo { width: 96px; height: 128px; margin: 0 auto 20px; border-radius: 3px; overflow: hidden; background: rgba(255,255,255,.15); }
#resume_pc.tpl-sidebar .r-side-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
#resume_pc.tpl-sidebar .r-side-block { margin-bottom: 18px; }
#resume_pc.tpl-sidebar .r-side-block:last-child { margin-bottom: 0; }
#resume_pc.tpl-sidebar .r-side-info-item { display: flex; align-items: flex-start; gap: 7px; font-size: ${fontSize - 0.5}px; line-height: 1.95; word-break: break-all; }
#resume_pc.tpl-sidebar .r-side-dot { flex: 0 0 5px; width: 5px; height: 5px; margin-top: 8px; border-radius: 50%; background: rgba(255,255,255,.65); }
#resume_pc.tpl-sidebar .r-side-title { padding-bottom: ${titleGap}px; margin-bottom: ${lineGap}px; font-size: ${fontSize}px; font-weight: bold; letter-spacing: 1px; color: #fff; border-bottom: 1px solid rgba(255,255,255,.35); }
#resume_pc.tpl-sidebar .r-side-content { font-size: ${fontSize - 0.5}px; line-height: 1.8; color: rgba(255,255,255,.88); }
#resume_pc.tpl-sidebar .r-side-content p { margin: 0; }
#resume_pc.tpl-sidebar .r-side-content ul { padding-left: 16px; list-style: disc; }
#resume_pc.tpl-sidebar .r-side-content ol { padding-left: 16px; list-style: decimal; }
#resume_pc.tpl-sidebar .r-side .r-side-content b, #resume_pc.tpl-sidebar .r-side .r-side-content strong { color: #fff; }
#resume_pc.tpl-sidebar .r-side-skills { margin-top: 8px; }
#resume_pc.tpl-sidebar .r-side-skill { margin-bottom: 9px; }
#resume_pc.tpl-sidebar .r-side-skill:last-child { margin-bottom: 0; }
#resume_pc.tpl-sidebar .r-side-skill-name { font-size: ${fontSize - 0.5}px; margin-bottom: 4px; color: rgba(255,255,255,.92); }
#resume_pc.tpl-sidebar .r-side-skill-bar { height: 6px; border-radius: 3px; background: rgba(255,255,255,.22); overflow: hidden; }
#resume_pc.tpl-sidebar .r-side-skill-bar i { display: block; height: 100%; border-radius: 3px; background: #d7dee6; }
#resume_pc.tpl-sidebar .r-side-skill-val { margin-top: 2px; font-size: ${Math.max(9, fontSize - 2)}px; text-align: right; color: rgba(255,255,255,.7); }

/* 右侧主内容 */
#resume_pc.tpl-sidebar .r-main { flex: 1; min-width: 0; padding: 26px 30px 30px 26px; }
#resume_pc.tpl-sidebar .r-side-name { padding-bottom: 10px; margin-bottom: 12px; font-size: 28px; font-weight: bold; letter-spacing: 2px; color: ${skin}; border-bottom: 2px solid ${skin}; }
#resume_pc.tpl-sidebar .r-side-yixiang { display: flex; flex-wrap: wrap; gap: 4px 18px; margin: 0 0 4px; padding: 0; list-style: none; font-size: ${fontSize}px; color: #444; }
#resume_pc.tpl-sidebar .r-side-yixiang li { list-style: none; }
#resume_pc.tpl-sidebar .r-side-yixiang li b { font-weight: bold; color: ${skin}; }
#resume_pc.tpl-sidebar .r-side-module { margin-top: ${mm}px; }
#resume_pc.tpl-sidebar .r-side-module:first-of-type { margin-top: 14px; }
#resume_pc.tpl-sidebar .r-side-module-title { display: flex; align-items: center; gap: 8px; padding-bottom: ${titleGap}px; margin-bottom: ${lineGap}px; font-size: ${titleSize}px; font-weight: bold; letter-spacing: 1px; color: ${skin}; border-bottom: 1px solid ${skin}; }
#resume_pc.tpl-sidebar .r-side-module-ic { flex: 0 0 8px; width: 8px; height: 8px; border-radius: 2px; background-color: ${skin}; }
#resume_pc.tpl-sidebar .r-side-item { margin-bottom: ${itemGap}px; }
#resume_pc.tpl-sidebar .r-side-item:last-child { margin-bottom: 0; }
#resume_pc.tpl-sidebar .r-side-item-top { display: flex; align-items: baseline; gap: 14px; margin: 0; padding: 0; list-style: none; font-size: ${fontSize + 1}px; color: #333; }
#resume_pc.tpl-sidebar .r-side-item-top li { list-style: none; }
#resume_pc.tpl-sidebar .r-side-item-time { flex: 0 0 auto; color: #555; font-weight: 400; }
#resume_pc.tpl-sidebar .r-side-item-name { font-weight: bold; }
#resume_pc.tpl-sidebar .r-side-module-body .r-side-content { margin-top: 3px; font-size: ${fontSize}px; line-height: ${lineHeight}; color: #444; }
#resume_pc.tpl-sidebar .r-side-content ul ul { list-style: circle; }
#resume_pc.tpl-sidebar .r-side-content ul ul ul { list-style: square; }
#resume_pc.tpl-sidebar .r-side-content li { list-style: inherit; }

/* 报考信息 */
#resume_pc.tpl-sidebar .r-baokao-head { font-weight: bold; margin-bottom: 4px; }
#resume_pc.tpl-sidebar .r-baokao-scores { display: flex; flex-wrap: wrap; }
#resume_pc.tpl-sidebar .r-baokao-score { margin-right: 24px; }
#resume_pc.tpl-sidebar .r-baokao-score b { color: ${skin}; }
`;
}
