import { useState, useCallback } from "react";
import "./App.css";
import Preview from "./components/Preview";
import PersonalEditor from "./components/modules/PersonalEditor";
import EducationEditor from "./components/modules/EducationEditor";
import WorkEditor from "./components/modules/WorkEditor";
import SkillsEditor from "./components/modules/SkillsEditor";
import ProjectsEditor from "./components/modules/ProjectsEditor";
import CustomEditor from "./components/modules/CustomEditor";

import { exportToPDF } from "./utils/pdf";
import { exportToJSON, importFromJSON } from "./utils/json";

import type {
  ResumeModule,
  PersonalModule,
  EducationModule,
  WorkModule,
  SkillsModule,
  ProjectsModule,
  CustomModule,
} from "./types/index";
import { Button, Checkbox, Card, Space, message, Slider, Input } from "antd";
import {
  DeleteOutlined,
  VerticalAlignTopOutlined,
  PlusOutlined,
  CopyOutlined,
  FontSizeOutlined,
  LineHeightOutlined,
} from "@ant-design/icons";

function App() {
  // 初始模块列表
  const [modules, setModules] = useState<ResumeModule[]>([
    {
      id: "1",
      type: "personal",
      title: "个人信息",
      visible: true,
      order: 1,
      data: {
        name: "张三",
        title: "前端开发工程师",
        email: "zhangsan@example.com",
        phone: "13800138000",
        address: "北京市朝阳区",
        summary:
          "具有5年前端开发经验，熟悉React、Vue等前端框架，擅长构建响应式网页和单页应用。",
        photo: "",
      },
      styles: {},
    },
    {
      id: "2",
      type: "education",
      title: "教育背景",
      visible: true,
      order: 2,
      data: [
        {
          id: "1",
          school: "北京大学",
          degree: "本科",
          field: "计算机科学与技术",
          startDate: "2015-09",
          endDate: "2019-06",
          description: "主修课程：数据结构、算法、计算机网络、操作系统",
          styles: {},
        },
      ],
    },
    {
      id: "3",
      type: "work",
      title: "工作经验",
      visible: true,
      order: 3,
      data: [
        {
          id: "1",
          company: "ABC科技有限公司",
          position: "前端开发工程师",
          startDate: "2019-07",
          endDate: "至今",
          description:
            "负责公司产品的前端开发，使用React构建单页应用，优化用户体验，提高页面性能。",
          styles: {},
        },
      ],
    },
    {
      id: "4",
      type: "skills",
      title: "技能",
      visible: true,
      order: 4,
      data: [
        { id: "1", name: "HTML/CSS", level: 5 },
        { id: "2", name: "JavaScript", level: 4 },
        { id: "3", name: "React", level: 4 },
        { id: "4", name: "Vue", level: 3 },
      ],
    },
    {
      id: "5",
      type: "projects",
      title: "项目经历",
      visible: true,
      order: 5,
      data: [
        {
          id: "1",
          name: "企业管理系统",
          description:
            "使用React和Ant Design构建的企业管理系统，包含用户管理、权限控制、数据统计等功能。",
          technologies: ["React", "Ant Design", "Node.js", "MongoDB"],
          link: "https://github.com/username/project",
          styles: {},
        },
      ],
    },
  ]);

  // 拖拽状态
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // 当前编辑的模块ID
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  // 预览区域间距控制
  const [spacing, setSpacing] = useState<number>(1);
  // 模块内部行间距控制
  const [lineSpacing, setLineSpacing] = useState<number>(1);
  // 模块间间距控制
  const [moduleSpacing, setModuleSpacing] = useState<number>(1);

  // 设置面板显示状态
  const [showGlobalSettings, setShowGlobalSettings] = useState<boolean>(false);

  // 模块与分割线间距
  const [moduleDividerSpacing, setModuleDividerSpacing] = useState<number>(1);
  // 模块首行与分割线间距
  const [moduleFirstLineSpacing, setModuleFirstLineSpacing] =
    useState<number>(1);
  // 模块标题字体大小
  const [moduleTitleFontSize, setModuleTitleFontSize] = useState<number>(20);
  // 内容字体大小
  const [contentFontSize, setContentFontSize] = useState<number>(14);

  // 编辑模块标题的状态
  const [editingModuleTitle, setEditingModuleTitle] = useState<string | null>(
    null,
  );
  const [moduleTitleValue, setModuleTitleValue] = useState<string>("");

  // 处理保存简历
  const handleSaveResume = async () => {
    try {
      const resumeName = prompt("请输入简历名称:", "我的简历");
      if (!resumeName) return;

      const exportData = {
        modules,
        timestamp: new Date().toISOString(),
      };

      exportToJSON(exportData, `${resumeName}.json`);
      message.success("简历保存成功！");
    } catch (error) {
      console.error("保存简历失败:", error);
      message.error("保存简历失败，请重试。");
    }
  };

  // 处理打开简历列表

  // 切换模块显示状态
  const toggleModuleVisibility = useCallback(
    (id: string) => {
      setModules(
        modules.map((module) =>
          module.id === id ? { ...module, visible: !module.visible } : module,
        ),
      );
    },
    [modules],
  );

  // 处理模块编辑点击
  const handleEditModule = useCallback(
    (id: string) => {
      setEditingModuleId(editingModuleId === id ? null : id);
    },
    [editingModuleId],
  );

  // 处理个人信息更新
  const handlePersonalUpdate = useCallback(
    (data: PersonalModule["data"]) => {
      setModules(
        modules.map((module) =>
          module.type === "personal" ? { ...module, data } : module,
        ),
      );
    },
    [modules],
  );

  // 处理个人信息样式更新
  const handlePersonalStylesUpdate = useCallback(
    (styles: PersonalModule["styles"]) => {
      setModules(
        modules.map((module) =>
          module.type === "personal" ? { ...module, styles } : module,
        ),
      );
    },
    [modules],
  );

  // 处理教育背景更新
  const handleEducationUpdate = useCallback(
    (data: EducationModule["data"]) => {
      setModules(
        modules.map((module) =>
          module.type === "education" ? { ...module, data } : module,
        ),
      );
    },
    [modules],
  );

  // 处理教育背景项样式更新
  const handleEducationItemStylesUpdate = useCallback(
    (id: string, styles: any) => {
      setModules(
        modules.map((module) => {
          if (module.type === "education") {
            const newData = (module.data as any[]).map((item) => {
              if (item.id === id) {
                return { ...item, styles };
              }
              return item;
            });
            return { ...module, data: newData };
          }
          return module;
        }),
      );
    },
    [modules],
  );

  // 处理教育背景项日期靠右对齐
  const handleEducationItemDateAlign = useCallback(
    (id: string, dateRightAlign: boolean) => {
      setModules(
        modules.map((module) => {
          if (module.type === "education") {
            const newData = (module.data as any[]).map((item) => {
              if (item.id === id) {
                return { ...item, dateRightAlign };
              }
              return item;
            });
            return { ...module, data: newData };
          }
          return module;
        }),
      );
    },
    [modules],
  );

  // 处理工作经验更新
  const handleWorkUpdate = useCallback(
    (data: WorkModule["data"]) => {
      setModules(
        modules.map((module) =>
          module.type === "work" ? { ...module, data } : module,
        ),
      );
    },
    [modules],
  );

  // 处理工作经验项样式更新
  const handleWorkItemStylesUpdate = useCallback(
    (id: string, styles: any) => {
      setModules(
        modules.map((module) => {
          if (module.type === "work") {
            const newData = (module.data as any[]).map((item) => {
              if (item.id === id) {
                return { ...item, styles };
              }
              return item;
            });
            return { ...module, data: newData };
          }
          return module;
        }),
      );
    },
    [modules],
  );

  // 处理工作经验项日期靠右对齐
  const handleWorkItemDateAlign = useCallback(
    (id: string, dateRightAlign: boolean) => {
      setModules(
        modules.map((module) => {
          if (module.type === "work") {
            const newData = (module.data as any[]).map((item) => {
              if (item.id === id) {
                return { ...item, dateRightAlign };
              }
              return item;
            });
            return { ...module, data: newData };
          }
          return module;
        }),
      );
    },
    [modules],
  );

  // 处理技能更新
  const handleSkillsUpdate = useCallback(
    (data: SkillsModule["data"]) => {
      setModules(
        modules.map((module) =>
          module.type === "skills" ? { ...module, data } : module,
        ),
      );
    },
    [modules],
  );

  // 处理项目经历更新
  const handleProjectsUpdate = useCallback(
    (data: ProjectsModule["data"]) => {
      setModules(
        modules.map((module) =>
          module.type === "projects" ? { ...module, data } : module,
        ),
      );
    },
    [modules],
  );

  // 处理项目经历项样式更新
  const handleProjectsItemStylesUpdate = useCallback(
    (id: string, styles: any) => {
      setModules(
        modules.map((module) => {
          if (module.type === "projects") {
            const newData = (module.data as any[]).map((item) => {
              if (item.id === id) {
                return { ...item, styles };
              }
              return item;
            });
            return { ...module, data: newData };
          }
          return module;
        }),
      );
    },
    [modules],
  );

  // 处理自定义模块更新
  const handleCustomUpdate = useCallback(
    (data: CustomModule["data"]) => {
      setModules(
        modules.map((module) =>
          module.type === "custom" ? { ...module, data } : module,
        ),
      );
    },
    [modules],
  );

  // 处理自定义模块项样式更新
  const handleCustomItemStylesUpdate = useCallback(
    (id: string, styles: any) => {
      setModules(
        modules.map((module) => {
          if (module.type === "custom") {
            const newData = (module.data as any[]).map((item) => {
              if (item.id === id) {
                return { ...item, styles };
              }
              return item;
            });
            return { ...module, data: newData };
          }
          return module;
        }),
      );
    },
    [modules],
  );

  // 处理PDF导出
  const handleExportPDF = async () => {
    await exportToPDF("resume-preview", "resume.pdf");
  };

  // 处理JSON导出
  const handleExportJSON = () => {
    const exportData = {
      modules,
      timestamp: new Date().toISOString(),
    };
    exportToJSON(exportData, "resume.json");
  };

  // 处理JSON导入
  const handleImportJSON = () => {
    // 创建文件输入元素
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";

    // 监听文件选择
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        try {
          // 导入JSON数据
          const importedData = await importFromJSON(file);

          // 更新模块
          if (importedData.modules) {
            setModules(importedData.modules);
          }

          // 提示用户导入成功
          message.success("JSON导入成功！");
        } catch (error) {
          // 提示用户导入失败
          message.error("JSON导入失败：" + (error as Error).message);
        }
      }
    };

    // 触发文件选择对话框
    fileInput.click();
  };

  // 渲染模块编辑器
  const renderModuleEditor = (module: ResumeModule) => {
    if (editingModuleId !== module.id) return null;

    return (
      <div className="mt-4 border-t border-gray-200 pt-4 animate-fadeIn">
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          {module.type === "personal" && (
            <PersonalEditor
              data={module.data}
              onUpdate={handlePersonalUpdate}
              styles={module.styles}
              onUpdateStyles={handlePersonalStylesUpdate}
            />
          )}
          {module.type === "education" && (
            <EducationEditor
              data={module.data}
              onUpdate={handleEducationUpdate}
              onUpdateItemStyles={handleEducationItemStylesUpdate}
              onUpdateItemDateAlign={handleEducationItemDateAlign}
            />
          )}
          {module.type === "work" && (
            <WorkEditor
              data={module.data}
              onUpdate={handleWorkUpdate}
              onUpdateItemStyles={handleWorkItemStylesUpdate}
              onUpdateItemDateAlign={handleWorkItemDateAlign}
            />
          )}
          {module.type === "skills" && (
            <SkillsEditor data={module.data} onUpdate={handleSkillsUpdate} />
          )}
          {module.type === "projects" && (
            <ProjectsEditor
              data={module.data}
              onUpdate={handleProjectsUpdate}
              onUpdateItemStyles={handleProjectsItemStylesUpdate}
            />
          )}
          {module.type === "custom" && (
            <CustomEditor
              data={module.data}
              onUpdate={handleCustomUpdate}
              onUpdateItemStyles={handleCustomItemStylesUpdate}
            />
          )}
        </div>
      </div>
    );
  };

  // 处理拖拽开始
  const handleDragStart = useCallback((id: string) => {
    setDraggingId(id);
  }, []);

  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  // 处理拖拽放置
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // 处理拖拽进入
  const handleDragEnter = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (draggingId === targetId) return;

      const newModules = [...modules];
      const draggingIndex = newModules.findIndex(
        (module) => module.id === draggingId,
      );
      const targetIndex = newModules.findIndex(
        (module) => module.id === targetId,
      );

      if (draggingIndex !== -1 && targetIndex !== -1) {
        const [draggedModule] = newModules.splice(draggingIndex, 1);
        newModules.splice(targetIndex, 0, draggedModule);

        // 更新顺序
        newModules.forEach((module, index) => {
          module.order = index + 1;
        });

        setModules(newModules);
      }
    },
    [modules, draggingId],
  );

  // 处理添加模块
  const handleAddModule = useCallback(() => {
    // 生成新模块ID
    const newId = `module-${Date.now()}`;
    // 获取新模块的顺序
    const newOrder = modules.length + 1;

    // 创建自定义模块
    const newModule: ResumeModule = {
      id: newId,
      type: "custom",
      title: "自定义模块",
      visible: true,
      order: newOrder,
      source: "custom",
      data: [],
    };

    // 添加新模块到列表
    setModules([...modules, newModule]);
  }, [modules]);

  // 处理开始编辑模块标题
  const handleStartEditModuleTitle = useCallback(
    (moduleId: string, currentTitle: string) => {
      setEditingModuleTitle(moduleId);
      setModuleTitleValue(currentTitle);
    },
    [],
  );

  // 处理复制模块
  const handleCopyModule = useCallback(
    (module: ResumeModule) => {
      const newId = `module-${Date.now()}`;
      const newOrder = modules.length + 1;

      const copiedModule: ResumeModule = {
        ...JSON.parse(JSON.stringify(module)),
        id: newId,
        title: `${module.title} (副本)`,
        order: newOrder,
        source: "copied",
      };

      setModules([...modules, copiedModule]);
      message.success("模块复制成功！");
    },
    [modules],
  );

  // 处理保存模块标题
  const handleSaveModuleTitle = useCallback(() => {
    if (editingModuleTitle && moduleTitleValue.trim()) {
      setModules(
        modules.map((module) =>
          module.id === editingModuleTitle
            ? { ...module, title: moduleTitleValue.trim() }
            : module,
        ),
      );
    }
    setEditingModuleTitle(null);
    setModuleTitleValue("");
  }, [modules, editingModuleTitle, moduleTitleValue]);

  // 处理取消编辑模块标题
  const handleCancelEditModuleTitle = useCallback(() => {
    setEditingModuleTitle(null);
    setModuleTitleValue("");
  }, []);

  // 处理删除模块
  const handleDeleteModule = useCallback(
    (moduleId: string) => {
      if (window.confirm("确定要删除这个模块吗？")) {
        try {
          setModules(modules.filter((module) => module.id !== moduleId));
          message.success("模块删除成功！");
        } catch (error) {
          console.error("删除模块失败:", error);
          message.error("删除模块失败，请重试。");
        }
      }
    },
    [modules],
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <Space>
                <h1 className="text-xl font-bold text-gray-800">简历编辑器</h1>

                {/* 全局调整按钮 */}
                <Button
                  icon={<LineHeightOutlined />}
                  onClick={() => {
                    setShowGlobalSettings(!showGlobalSettings);
                  }}
                  className={showGlobalSettings ? "bg-gray-100" : ""}
                >
                  全局调整
                </Button>
              </Space>
            </div>
            <Space>
              <Button type="primary" onClick={handleSaveResume}>
                保存简历
              </Button>

              <Button type="primary" onClick={handleExportPDF}>
                导出PDF
              </Button>
              <Button type="primary" danger onClick={handleExportJSON}>
                导出JSON
              </Button>
              <Button type="default" onClick={handleImportJSON}>
                导入JSON
              </Button>
            </Space>
          </div>

          {/* 全局调整设置面板 */}
          {showGlobalSettings && (
            <div className="border-t border-gray-200 pt-3 mb-4">
              <div className="flex flex-wrap items-center gap-6">
                {/* 整体缩放 */}
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <VerticalAlignTopOutlined className="mr-1" /> 整体缩放
                  </span>
                  <span>{Math.round(spacing * 100)}%</span>
                  <Slider
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    value={spacing}
                    onChange={setSpacing}
                    style={{ width: 100 }}
                  />
                </div>

                {/* 行间距 */}
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <VerticalAlignTopOutlined className="mr-1" /> 行间距
                  </span>
                  <span>{lineSpacing.toFixed(1)}x</span>
                  <Slider
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={lineSpacing}
                    onChange={setLineSpacing}
                    style={{ width: 100 }}
                  />
                </div>

                {/* 模块间距 */}
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <VerticalAlignTopOutlined className="mr-1" /> 模块间距
                  </span>
                  <span>{moduleSpacing.toFixed(1)}x</span>
                  <Slider
                    min={0.0}
                    max={1.5}
                    step={0.1}
                    value={moduleSpacing}
                    onChange={setModuleSpacing}
                    style={{ width: 100 }}
                  />
                </div>

                {/* 模块与分割线间距 */}
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <VerticalAlignTopOutlined className="mr-1" />{" "}
                    模块与分割线间距
                  </span>
                  <span>{moduleDividerSpacing.toFixed(1)}x</span>
                  <Slider
                    min={-1.5}
                    max={1.5}
                    step={0.1}
                    value={moduleDividerSpacing}
                    onChange={setModuleDividerSpacing}
                    style={{ width: 100 }}
                  />
                </div>

                {/* 模块首行与分割线间距 */}
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <VerticalAlignTopOutlined className="mr-1" />{" "}
                    首行与分割线间距
                  </span>
                  <span>{moduleFirstLineSpacing.toFixed(1)}x</span>
                  <Slider
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    value={moduleFirstLineSpacing}
                    onChange={setModuleFirstLineSpacing}
                    style={{ width: 100 }}
                  />
                </div>

                {/* 模块标题字体大小 */}
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <FontSizeOutlined className="mr-1" /> 标题字体大小
                  </span>
                  <span>{moduleTitleFontSize}px</span>
                  <Slider
                    min={16}
                    max={32}
                    step={1}
                    value={moduleTitleFontSize}
                    onChange={setModuleTitleFontSize}
                    style={{ width: 100 }}
                  />
                </div>

                {/* 内容字体大小 */}
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    <FontSizeOutlined className="mr-1" /> 内容字体大小
                  </span>
                  <span>{contentFontSize}px</span>
                  <Slider
                    min={12}
                    max={24}
                    step={1}
                    value={contentFontSize}
                    onChange={setContentFontSize}
                    style={{ width: 100 }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-6 py-6">
        <div className="flex flex-row gap-6 w-full">
          {/* 左侧编辑区域 */}
          <div className="w-1/3 bg-white rounded-lg shadow-sm p-6 flex-shrink-0 min-w-[300px]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              模块编辑
            </h2>
            <div className="space-y-4">
              {/* 模块列表 */}
              {modules.map((module) => {
                if (renderModuleEditor(module)) {
                  return (
                    <Card
                      key={module.id}
                      className={`module-item ${draggingId === module.id ? "dragging" : ""}`}
                      draggable
                      onDragStart={() => handleDragStart(module.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, module.id)}
                      title={
                        editingModuleTitle === module.id ? (
                          <Input
                            value={moduleTitleValue}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setModuleTitleValue(e.target.value)}
                            onBlur={handleSaveModuleTitle}
                            onKeyPress={(
                              e: React.KeyboardEvent<HTMLInputElement>,
                            ) => {
                              if (e.key === "Enter") handleSaveModuleTitle();
                              if (e.key === "Escape")
                                handleCancelEditModuleTitle();
                            }}
                            autoFocus
                            size="small"
                            placeholder="输入模块名称"
                            style={{ width: 180 }}
                          />
                        ) : (
                          <div
                            onClick={() => handleEditModule(module.id)}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleStartEditModuleTitle(
                                module.id,
                                module.title,
                              );
                            }}
                            className="cursor-pointer hover:text-blue-600 font-medium text-lg"
                          >
                            {module.title}
                          </div>
                        )
                      }
                      extra={
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={module.visible}
                            onChange={() => toggleModuleVisibility(module.id)}
                          >
                            显示
                          </Checkbox>
                          <Button
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyModule(module)}
                          >
                            复制
                          </Button>
                          {(module.source === "copied" ||
                            module.source === "custom") && (
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteModule(module.id)}
                            >
                              删除
                            </Button>
                          )}
                        </div>
                      }
                    >
                      {/* 模块编辑器 */}
                      {renderModuleEditor(module)}
                    </Card>
                  );
                } else {
                  return (
                    <Card
                      key={module.id}
                      className={`module-item ${draggingId === module.id ? "dragging" : ""}`}
                      draggable
                      onDragStart={() => handleDragStart(module.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, module.id)}
                      title={
                        editingModuleTitle === module.id ? (
                          <Input
                            value={moduleTitleValue}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setModuleTitleValue(e.target.value)}
                            onBlur={handleSaveModuleTitle}
                            onKeyPress={(
                              e: React.KeyboardEvent<HTMLInputElement>,
                            ) => {
                              if (e.key === "Enter") handleSaveModuleTitle();
                              if (e.key === "Escape")
                                handleCancelEditModuleTitle();
                            }}
                            autoFocus
                            size="small"
                            placeholder="输入模块名称"
                            style={{ width: 180 }}
                          />
                        ) : (
                          <div
                            onClick={() => handleEditModule(module.id)}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleStartEditModuleTitle(
                                module.id,
                                module.title,
                              );
                            }}
                            className="cursor-pointer hover:text-blue-600 font-medium text-lg"
                          >
                            {module.title}
                          </div>
                        )
                      }
                      extra={
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={module.visible}
                            onChange={() => toggleModuleVisibility(module.id)}
                          >
                            显示
                          </Checkbox>
                          <Button
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyModule(module)}
                          >
                            复制
                          </Button>
                          {(module.source === "copied" ||
                            module.source === "custom") && (
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteModule(module.id)}
                            >
                              删除
                            </Button>
                          )}
                        </div>
                      }
                    />
                  );
                }
              })}

              {/* 添加模块按钮 */}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={handleAddModule}
              >
                添加模块
              </Button>
            </div>
          </div>

          {/* 右侧预览区域 */}
          <div className="w-2/3 flex-shrink-0">
            <Card title="简历预览">
              <div id="resume-preview" className="border rounded-md p-8">
                {/* 预览内容 */}
                <Preview
                  modules={modules}
                  spacing={spacing}
                  lineSpacing={lineSpacing}
                  moduleSpacing={moduleSpacing}
                  moduleDividerSpacing={moduleDividerSpacing}
                  moduleFirstLineSpacing={moduleFirstLineSpacing}
                  moduleTitleFontSize={moduleTitleFontSize}
                  contentFontSize={contentFontSize}
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
