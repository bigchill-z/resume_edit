# 简历编辑器

一个功能强大、易于使用的在线简历编辑器，使用 React + TypeScript + Vite 构建。

## ✨ 功能特性

- 📝 **多模块编辑**：支持个人信息、教育背景、工作经验、技能、项目经历、自定义模块等
- 🎨 **丰富的样式控制**：
  - 文本加粗
  - 字体颜色自定义
  - 日期位置可选择是否靠右对齐
- 🎯 **全局调整**：
  - 整体缩放
  - 行间距
  - 模块间距
  - 模块与分割线间距
  - 首行与分割线间距
  - 标题字体大小
- 💾 **数据导出**：支持导出为 PDF 和 JSON 格式
- 📥 **数据导入**：支持从 JSON 文件导入简历数据
- 📱 **实时预览**：所见即所得，编辑时实时预览效果
- 🔄 **模块拖拽排序**：自由调整模块顺序

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **UI 组件库**：Ant Design 5
- **样式方案**：Tailwind CSS 4
- **PDF 生成**：html2canvas + jspdf

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

然后在浏览器中打开 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📋 使用说明

1. **编辑模块**：点击左侧模块卡片进行编辑
2. **调整样式**：在每个输入框旁边可以设置加粗和字体颜色
3. **日期对齐**：在教育和工作模块中，可以设置日期是否靠右对齐
4. **全局设置**：点击顶部「全局调整」按钮，调整整体布局和样式
5. **添加模块**：点击「添加模块」按钮添加自定义模块
6. **导出简历**：点击顶部「导出 PDF」或「导出 JSON」保存您的简历

## 📦 项目结构

```
new_resume/
├── src/
│   ├── components/
│   │   ├── common/           # 公共组件
│   │   │   └── StyleControls.tsx  # 样式控制组件（加粗、颜色）
│   │   ├── modules/          # 各模块编辑器组件
│   │   │   ├── PersonalEditor.tsx
│   │   │   ├── EducationEditor.tsx
│   │   │   ├── WorkEditor.tsx
│   │   │   ├── SkillsEditor.tsx
│   │   │   ├── ProjectsEditor.tsx
│   │   │   └── CustomEditor.tsx
│   │   ├── Preview.tsx        # 预览组件
│   │   └── ResumeList.tsx
│   ├── hooks/                # 自定义 Hooks
│   │   └── useListEditor.ts  # 列表编辑器通用逻辑 Hook
│   ├── types/
│   │   └── index.ts           # TypeScript 类型定义
│   ├── utils/
│   │   ├── pdf.ts             # PDF 导出工具
│   │   ├── json.ts            # JSON 导入导出工具
│   │   └── storage.ts
│   ├── App.tsx                # 主应用组件
│   ├── main.tsx               # 应用入口
│   └── index.css
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
