// 桌面版预加载脚本：仅向页面暴露保存导出文件的能力（不开放 Node 权限）
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("resumeDesktop", {
  isDesktop: true,
  // 选择目录并保存已导出的文件（src 形如 /files/xxx.pdf）
  saveExportAs: (payload) => ipcRenderer.invoke("save-export-as", payload),
});
