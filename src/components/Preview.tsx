import React, { useEffect, useRef, useState } from "react";
import type {
  ResumeModule,
  PersonalModule,
  EducationModule,
  WorkModule,
  SkillsModule,
  ProjectsModule,
} from "../types/index";
import { Typography, Divider, Space, Tag } from "antd";

const { Title, Paragraph, Text } = Typography;

interface PreviewProps {
  modules: ResumeModule[];
  spacing: number;
  lineSpacing: number;
  moduleSpacing: number;
  moduleDividerSpacing?: number;
  moduleFirstLineSpacing?: number;
  moduleTitleFontSize?: number;
  contentFontSize?: number;
}

const Preview: React.FC<PreviewProps> = ({
  modules,
  spacing,
  lineSpacing,
  moduleSpacing,
  moduleDividerSpacing = 1,
  moduleFirstLineSpacing = 1,
  moduleTitleFontSize = 20,
  contentFontSize = 14,
}) => {
  // 按顺序排序模块
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  // 渲染个人信息模块
  const renderPersonalModule = () => {
    const personalModule = modules.find(
      (module) => module.type === "personal",
    ) as PersonalModule;
    if (!personalModule || !personalModule.visible) return null;
    const data = personalModule.data;

    return (
      <div
        className="flex items-center justify-between mb-8"
        style={{ maxWidth: "100%", overflow: "hidden" }}
      >
        <div className="flex-1 text-center" style={{ flexShrink: 1 }}>
          <Title
            level={2}
            style={{
              marginBottom: 8,
              fontWeight: personalModule.styles?.name?.bold ? "bold" : "normal",
              color: personalModule.styles?.name?.color,
            }}
          >
            {data.name || "姓名"}
          </Title>
          <Paragraph
            style={{
              marginBottom: 16,
              whiteSpace: "pre-line",
              fontWeight: personalModule.styles?.title?.bold
                ? "bold"
                : "normal",
              color: personalModule.styles?.title?.color,
              fontSize: contentFontSize,
            }}
          >
            {data.title || "职位"}
          </Paragraph>
          <Space direction="vertical" size={4} style={{ marginBottom: 16 }}>
            {data.email && (
              <Text
                type="secondary"
                style={{
                  fontWeight: personalModule.styles?.email?.bold
                    ? "bold"
                    : "normal",
                  color: personalModule.styles?.email?.color,
                  fontSize: contentFontSize,
                }}
              >
                {data.email}
              </Text>
            )}
            {data.phone && (
              <Text
                type="secondary"
                style={{
                  fontWeight: personalModule.styles?.phone?.bold
                    ? "bold"
                    : "normal",
                  color: personalModule.styles?.phone?.color,
                  fontSize: contentFontSize,
                }}
              >
                {data.phone}
              </Text>
            )}
            {data.address && (
              <Text
                type="secondary"
                style={{
                  fontWeight: personalModule.styles?.address?.bold
                    ? "bold"
                    : "normal",
                  color: personalModule.styles?.address?.color,
                  fontSize: contentFontSize,
                }}
              >
                {data.address}
              </Text>
            )}
          </Space>
          {data.summary && (
            <Paragraph
              style={{
                textAlign: "left",
                whiteSpace: "pre-line",
                fontWeight: personalModule.styles?.summary?.bold
                  ? "bold"
                  : "normal",
                color: personalModule.styles?.summary?.color,
                fontSize: contentFontSize,
              }}
            >
              {data.summary}
            </Paragraph>
          )}
        </div>
        {data.photo && (
          <div
            className="ml-8 flex-shrink-0 w-32 h-32  overflow-hidden rounded"
            style={{ flexBasis: "8rem", flexGrow: 0, flexShrink: 0 }}
          >
            <img
              src={data.photo}
              alt="证件照"
              className="w-full h-full object-cover"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // 渲染教育背景模块
  const renderEducationModule = (module: EducationModule) => {
    if (!module.visible) return null;
    const data = module.data;
    if (!data || data.length === 0) return null;

    return (
      <div className="mb-8">
        <Title
          level={3}
          style={{
            marginBottom: `${16 * moduleDividerSpacing}px`,
            fontSize: moduleTitleFontSize,
          }}
        >
          {module.title}
        </Title>
        <Divider style={{ marginBottom: `${8 * moduleFirstLineSpacing}px` }} />
        <div
          className="space-y-8"
          style={{ lineHeight: lineSpacing, whiteSpace: "pre-line" }}
        >
          {data.map((item) => (
            <div key={item.id}>
              {/* <Title
                level={4}
                style={{ marginBottom: 8, lineHeight: lineSpacing, whiteSpace: 'pre-line' }}
              >
                {item.school}
              </Title> */}
              {item.dateRightAlign ? (
                <div
                  className="flex justify-between items-center mb-8"
                  style={{ lineHeight: lineSpacing, whiteSpace: "pre-line" }}
                >
                  <div>
                    <Text
                      strong={item.styles?.school?.bold || false}
                      style={{
                        color: item.styles?.school?.color,
                        fontSize: contentFontSize,
                      }}
                    >
                      {item.school}
                    </Text>{" "}
                    |{" "}
                    <Text
                      strong={item.styles?.degree?.bold || false}
                      style={{
                        color: item.styles?.degree?.color,
                        fontSize: contentFontSize,
                      }}
                    >
                      {item.degree}
                    </Text>{" "}
                    |{" "}
                    <Text
                      style={{
                        fontWeight: item.styles?.field?.bold
                          ? "bold"
                          : "normal",
                        color: item.styles?.field?.color,
                        fontSize: contentFontSize,
                      }}
                    >
                      {item.field}
                    </Text>
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontWeight: item.styles?.date?.bold ? "bold" : "normal",
                      color: item.styles?.date?.color,
                      fontSize: contentFontSize,
                    }}
                  >
                    {item.startDate} - {item.endDate}
                  </Text>
                </div>
              ) : (
                <Paragraph
                  style={{
                    marginBottom: 8,
                    lineHeight: lineSpacing,
                    whiteSpace: "pre-line",
                    fontSize: contentFontSize,
                  }}
                >
                  <Text
                    strong={item.styles?.school?.bold || false}
                    style={{
                      color: item.styles?.school?.color,
                      fontSize: contentFontSize,
                    }}
                  >
                    {item.school}
                  </Text>{" "}
                  |{" "}
                  <Text
                    strong={item.styles?.degree?.bold || false}
                    style={{
                      color: item.styles?.degree?.color,
                      fontSize: contentFontSize,
                    }}
                  >
                    {item.degree}
                  </Text>{" "}
                  |{" "}
                  <Text
                    style={{
                      fontWeight: item.styles?.field?.bold ? "bold" : "normal",
                      color: item.styles?.field?.color,
                      fontSize: contentFontSize,
                    }}
                  >
                    {item.field}
                  </Text>{" "}
                  |{" "}
                  <Text
                    type="secondary"
                    style={{
                      fontWeight: item.styles?.date?.bold ? "bold" : "normal",
                      color: item.styles?.date?.color,
                      fontSize: contentFontSize,
                    }}
                  >
                    {item.startDate} - {item.endDate}
                  </Text>
                </Paragraph>
              )}
              {item.description && (
                <Paragraph
                  style={{
                    lineHeight: lineSpacing,
                    whiteSpace: "pre-line",
                    fontWeight: item.styles?.description?.bold
                      ? "bold"
                      : "normal",
                    color: item.styles?.description?.color,
                    fontSize: contentFontSize,
                  }}
                >
                  {item.description}
                </Paragraph>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染工作经历模块
  const renderWorkModule = (module: WorkModule) => {
    if (!module.visible) return null;
    const data = module.data;
    if (!data || data.length === 0) return null;

    return (
      <div className="mb-8">
        <Title
          level={3}
          style={{
            marginBottom: `${16 * moduleDividerSpacing}px`,
            fontSize: moduleTitleFontSize,
          }}
        >
          {module.title}
        </Title>
        <Divider style={{ marginBottom: `${8 * moduleFirstLineSpacing}px` }} />
        <div
          className="space-y-8"
          style={{ lineHeight: lineSpacing, whiteSpace: "pre-line" }}
        >
          {data.map((item) => (
            <div key={item.id}>
              {/* <Title
                level={4}
                style={{ marginBottom: 8, lineHeight: lineSpacing, whiteSpace: 'pre-line' }}
              >
                {item.company}
              </Title> */}
              {item.dateRightAlign ? (
                <div
                  className="flex justify-between items-center mb-8"
                  style={{ lineHeight: lineSpacing, whiteSpace: "pre-line" }}
                >
                  <div>
                    <Text
                      strong={item.styles?.company?.bold || false}
                      style={{
                        color: item.styles?.company?.color,
                        fontSize: contentFontSize,
                      }}
                    >
                      {item.company}
                    </Text>{" "}
                    |{" "}
                    <Text
                      strong={item.styles?.position?.bold || false}
                      style={{
                        color: item.styles?.position?.color,
                        fontSize: contentFontSize,
                      }}
                    >
                      {item.position}
                    </Text>
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontWeight: item.styles?.date?.bold ? "bold" : "normal",
                      color: item.styles?.date?.color,
                      fontSize: contentFontSize,
                    }}
                  >
                    {item.startDate} - {item.endDate}
                  </Text>
                </div>
              ) : (
                <Paragraph
                  style={{
                    marginBottom: 8,
                    lineHeight: lineSpacing,
                    whiteSpace: "pre-line",
                    fontSize: contentFontSize,
                  }}
                >
                  <Text
                    strong={item.styles?.company?.bold || false}
                    style={{
                      color: item.styles?.company?.color,
                      fontSize: contentFontSize,
                    }}
                  >
                    {item.company}
                  </Text>{" "}
                  |{" "}
                  <Text
                    strong={item.styles?.position?.bold || false}
                    style={{
                      color: item.styles?.position?.color,
                      fontSize: contentFontSize,
                    }}
                  >
                    {item.position}
                  </Text>{" "}
                  |{" "}
                  <Text
                    type="secondary"
                    style={{
                      fontWeight: item.styles?.date?.bold ? "bold" : "normal",
                      color: item.styles?.date?.color,
                      fontSize: contentFontSize,
                    }}
                  >
                    {item.startDate} - {item.endDate}
                  </Text>
                </Paragraph>
              )}
              {item.description && (
                <Paragraph
                  style={{
                    lineHeight: lineSpacing,
                    whiteSpace: "pre-line",
                    fontWeight: item.styles?.description?.bold
                      ? "bold"
                      : "normal",
                    color: item.styles?.description?.color,
                    fontSize: contentFontSize,
                  }}
                >
                  {item.description}
                </Paragraph>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染技能模块
  const renderSkillsModule = (module: SkillsModule) => {
    if (!module.visible) return null;
    const data = module.data;
    if (!data || data.length === 0) return null;

    return (
      <div className="mb-8">
        <Title
          level={3}
          style={{
            marginBottom: `${16 * moduleDividerSpacing}px`,
            fontSize: moduleTitleFontSize,
          }}
        >
          {module.title}
        </Title>
        <Divider style={{ marginBottom: `${8 * moduleFirstLineSpacing}px` }} />
        <div
          className="grid grid-cols-2 gap-4"
          style={{ lineHeight: lineSpacing, whiteSpace: "pre-line" }}
        >
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center"
              style={{ lineHeight: lineSpacing, whiteSpace: "pre-line" }}
            >
              <Text
                style={{
                  width: 80,
                  lineHeight: lineSpacing,
                  fontSize: contentFontSize,
                }}
              >
                {item.name}
              </Text>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full skill-bar"
                  style={{ width: `${(item.level / 5) * 100}%` }}
                ></div>
              </div>
              <Text
                style={{
                  marginLeft: 8,
                  lineHeight: lineSpacing,
                  fontSize: contentFontSize,
                }}
              >
                {item.level}/5
              </Text>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染项目经历模块
  const renderProjectsModule = (module: ProjectsModule) => {
    if (!module.visible) return null;
    const data = module.data;
    if (!data || data.length === 0) return null;

    return (
      <div className="mb-8">
        <Title
          level={3}
          style={{
            marginBottom: `${16 * moduleDividerSpacing}px`,
            fontSize: moduleTitleFontSize,
          }}
        >
          {module.title}
        </Title>
        <Divider style={{ marginBottom: `${8 * moduleFirstLineSpacing}px` }} />
        <div
          className="space-y-8"
          style={{ lineHeight: lineSpacing, whiteSpace: "pre-line" }}
        >
          {data.map((item) => (
            <div key={item.id}>
              {/* <Title
                level={4}
                style={{
                  marginBottom: 8,
                  lineHeight: lineSpacing,
                  whiteSpace: "pre-line",
                }}
              >
                {item.name}
              </Title> */}
              <Paragraph
                style={{
                  lineHeight: lineSpacing,
                  whiteSpace: "pre-line",
                  fontWeight: item.styles?.name?.bold ? "bold" : "normal",
                  color: item.styles?.name?.color,
                  fontSize: contentFontSize,
                }}
              >
                {item.name}
              </Paragraph>
              {item.description && (
                <Paragraph
                  style={{
                    lineHeight: lineSpacing,
                    whiteSpace: "pre-line",
                    fontWeight: item.styles?.description?.bold
                      ? "bold"
                      : "normal",
                    color: item.styles?.description?.color,
                    fontSize: contentFontSize,
                  }}
                >
                  {item.description}
                </Paragraph>
              )}
              {item.technologies && item.technologies.length > 0 && (
                <div
                  className="mt-2"
                  style={{ lineHeight: lineSpacing, whiteSpace: "pre-line" }}
                >
                  <Text
                    strong
                    style={{
                      lineHeight: lineSpacing,
                      whiteSpace: "pre-line",
                      fontWeight: item.styles?.technologies?.bold
                        ? "bold"
                        : "normal",
                      color: item.styles?.technologies?.color,
                      fontSize: contentFontSize,
                    }}
                  >
                    技术栈：
                  </Text>
                  <Space wrap>
                    {item.technologies.map((tech, index) => (
                      <Tag
                        key={index}
                        color="blue"
                        style={{ color: item.styles?.technologies?.color }}
                      >
                        {tech}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}
              {item.link && (
                <Paragraph
                  className="mt-2"
                  style={{
                    lineHeight: lineSpacing,
                    whiteSpace: "pre-line",
                    fontSize: contentFontSize,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{
                      lineHeight: lineSpacing,
                      whiteSpace: "pre-line",
                      fontSize: contentFontSize,
                    }}
                  >
                    项目链接：
                  </Text>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{
                      lineHeight: lineSpacing,
                      whiteSpace: "pre-line",
                      fontWeight: item.styles?.link?.bold ? "bold" : "normal",
                      color: item.styles?.link?.color || "#1890ff",
                      fontSize: contentFontSize,
                    }}
                  >
                    {item.link}
                  </a>
                </Paragraph>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染自定义模块
  const renderCustomModule = () => {
    const customModules = modules.filter((module) => module.type === "custom");
    if (customModules.length === 0) return null;

    return (
      <>
        {customModules.map((module) => {
          if (!module.visible) return null;
          const data = module.data;
          if (!data || data.length === 0) return null;

          return (
            <div key={module.id} className="mb-8">
              <Title
                level={3}
                style={{
                  marginBottom: `${16 * moduleDividerSpacing}px`,
                  fontSize: moduleTitleFontSize,
                }}
              >
                {module.title}
              </Title>
              <Divider
                style={{ marginBottom: `${8 * moduleFirstLineSpacing}px` }}
              />
              <div
                className="space-y-6"
                style={{ lineHeight: lineSpacing, whiteSpace: "pre-line" }}
              >
                {data.map((item) => (
                  <div key={item.id}>
                    {item.label && item.labelInline ? (
                      <div className="flex items-baseline mb-2">
                        <Text
                          style={{
                            lineHeight: lineSpacing,
                            whiteSpace: "pre-line",
                            fontWeight: item.styles?.label?.bold
                              ? "bold"
                              : "normal",
                            color: item.styles?.label?.color,
                            fontSize: contentFontSize,
                            marginRight: 8,
                          }}
                        >
                          {item.label}:
                        </Text>
                        {item.content && (
                          <Paragraph
                            style={{
                              lineHeight: lineSpacing,
                              whiteSpace: "pre-line",
                              fontWeight: item.styles?.content?.bold
                                ? "bold"
                                : "normal",
                              color: item.styles?.content?.color,
                              fontSize: contentFontSize,
                              marginBottom: 0,
                            }}
                          >
                            {item.content}
                          </Paragraph>
                        )}
                      </div>
                    ) : (
                      <>
                        {item.label && (
                          <Title
                            level={4}
                            style={{
                              marginBottom: 8,
                              lineHeight: lineSpacing,
                              whiteSpace: "pre-line",
                              fontWeight: item.styles?.label?.bold
                                ? "bold"
                                : "normal",
                              color: item.styles?.label?.color,
                              fontSize: contentFontSize,
                            }}
                          >
                            {item.label}
                          </Title>
                        )}
                        {item.content && (
                          <Paragraph
                            style={{
                              lineHeight: lineSpacing,
                              whiteSpace: "pre-line",
                              fontWeight: item.styles?.content?.bold
                                ? "bold"
                                : "normal",
                              color: item.styles?.content?.color,
                              fontSize: contentFontSize,
                            }}
                          >
                            {item.content}
                          </Paragraph>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </>
    );
  };

  // 渲染模块
  const renderModule = (module: ResumeModule) => {
    if (!module.visible) return null;

    switch (module.type) {
      case "personal":
        return renderPersonalModule();
      case "education":
        return renderEducationModule(module as EducationModule);
      case "work":
        return renderWorkModule(module as WorkModule);
      case "skills":
        return renderSkillsModule(module as SkillsModule);
      case "projects":
        return renderProjectsModule(module as ProjectsModule);
      case "custom":
        return renderCustomModule();
      default:
        return null;
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[]>([]);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1 });

  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const PPI = 96;
  const MM_TO_PX = PPI / 25.4;
  const A4_WIDTH_PX = A4_WIDTH_MM * MM_TO_PX;
  const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX;
  const PAGE_PADDING_TOP = 40;
  const PAGE_PADDING_BOTTOM = 40;

  useEffect(() => {
    const calculatePages = () => {
      if (!containerRef.current) return;

      const currentWidth = containerRef.current.offsetWidth;
      const scaleFactor = currentWidth / A4_WIDTH_PX;
      const pageHeight = A4_HEIGHT_PX * scaleFactor;
      const effectivePageHeight =
        pageHeight - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;

      const moduleElements: { element: React.ReactNode; height: number }[] = [];

      sortedModules.forEach((module) => {
        moduleElements.push({
          element: (
            <div
              key={module.id}
              style={{
                marginBottom: `${2 * moduleSpacing}rem`,
                transition: "margin 0.3s ease",
              }}
            >
              {renderModule(module)}
            </div>
          ),
          height: 0,
        });
      });

      let currentPageElements: typeof moduleElements = [];
      let currentPageHeight = 0;
      const newPages: React.ReactNode[] = [];

      moduleElements.forEach((item, index) => {
        const tempDiv = document.createElement("div");
        tempDiv.style.width = `${currentWidth}px`;
        tempDiv.style.position = "absolute";
        tempDiv.style.visibility = "hidden";
        tempDiv.style.fontSize = `${contentFontSize}px`;
        tempDiv.style.lineHeight = `${lineSpacing}`;
        tempDiv.innerHTML = `
          <div style="margin-bottom: ${2 * moduleSpacing}rem">
            ${getModuleHTML(module as ResumeModule)}
          </div>
        `;
        document.body.appendChild(tempDiv);
        const itemHeight = tempDiv.offsetHeight;
        document.body.removeChild(tempDiv);

        if (
          currentPageHeight + itemHeight > effectivePageHeight &&
          currentPageElements.length > 0
        ) {
          newPages.push(
            <div
              key={`page-${newPages.length}`}
              className="max-w-2xl mx-auto"
              style={{
                height: effectivePageHeight,
                overflow: "hidden",
                paddingTop: PAGE_PADDING_TOP,
                paddingBottom: PAGE_PADDING_BOTTOM,
              }}
            >
              {currentPageElements.map((el, i) => (
                <div key={i}>{el.element}</div>
              ))}
            </div>,
          );
          currentPageElements = [];
          currentPageHeight = 0;
        }

        currentPageElements.push(item);
        currentPageHeight += itemHeight;

        if (
          index === moduleElements.length - 1 &&
          currentPageElements.length > 0
        ) {
          newPages.push(
            <div
              key={`page-${newPages.length}`}
              className="max-w-2xl mx-auto"
              style={{
                height: effectivePageHeight,
                overflow: "hidden",
                paddingTop: PAGE_PADDING_TOP,
                paddingBottom: PAGE_PADDING_BOTTOM,
              }}
            >
              {currentPageElements.map((el, i) => (
                <div key={i}>{el.element}</div>
              ))}
            </div>,
          );
        }
      });

      if (newPages.length === 0) {
        newPages.push(
          <div
            key="page-0"
            className="max-w-2xl mx-auto"
            style={{
              height: effectivePageHeight,
              overflow: "hidden",
              paddingTop: PAGE_PADDING_TOP,
              paddingBottom: PAGE_PADDING_BOTTOM,
            }}
          >
            {sortedModules.map((module) => (
              <div
                key={module.id}
                style={{
                  marginBottom: `${2 * moduleSpacing}rem`,
                }}
              >
                {renderModule(module)}
              </div>
            ))}
          </div>,
        );
      }

      setPages(newPages);
      setPageInfo({ currentPage: 1, totalPages: newPages.length });
    };

    const timeoutId = setTimeout(calculatePages, 100);
    return () => clearTimeout(timeoutId);
  }, [
    modules,
    spacing,
    lineSpacing,
    moduleSpacing,
    moduleDividerSpacing,
    moduleFirstLineSpacing,
    moduleTitleFontSize,
    contentFontSize,
  ]);

  return (
    <div className="relative">
      <div ref={containerRef} className="hidden" style={{ width: "794px" }} />
      {pages.map((page, index) => (
        <div key={index}>
          <div
            style={{
              transform: `scale(${spacing})`,
              transformOrigin: "top center",
              transition: "transform 0.3s ease",
            }}
          >
            {page}
          </div>
          <div className="text-center text-gray-400 text-sm py-2">
            第 {index + 1} 页 / 共 {pages.length} 页
          </div>
        </div>
      ))}
    </div>
  );
};

function getModuleHTML(module: ResumeModule): string {
  switch (module.type) {
    case "personal":
      return getPersonalModuleHTML(module);
    case "education":
      return getEducationModuleHTML(module);
    case "work":
      return getWorkModuleHTML(module);
    case "skills":
      return getSkillsModuleHTML(module);
    case "projects":
      return getProjectsModuleHTML(module);
    case "custom":
      return getCustomModuleHTML(module);
    default:
      return "";
  }
}

function getPersonalModuleHTML(module: PersonalModule): string {
  const data = module.data;
  return `
    <div class="flex items-center justify-between mb-8">
      <div class="flex-1 text-center">
        <h1 style="margin-bottom: 8px; font-weight: ${module.styles?.name?.bold ? "bold" : "normal"}; color: ${module.styles?.name?.color || "inherit"}">${data.name || "姓名"}</h1>
        <p style="margin-bottom: 16px; white-space: pre-line;">${data.title || "职位"}</p>
        <div>
          ${data.email ? `<span style="margin-right: 16px;">${data.email}</span>` : ""}
          ${data.phone ? `<span style="margin-right: 16px;">${data.phone}</span>` : ""}
          ${data.address ? `<span>${data.address}</span>` : ""}
        </div>
        ${data.summary ? `<p style="margin-top: 16px; white-space: pre-line;">${data.summary}</p>` : ""}
      </div>
    </div>
  `;
}

function getEducationModuleHTML(module: EducationModule): string {
  const data = module.data;
  if (!data || data.length === 0) return "";

  return data
    .map(
      (item) => `
    <div style="margin-bottom: 24px;">
      <div>
        <span style="font-weight: ${item.styles?.school?.bold ? "bold" : "normal"}; color: ${item.styles?.school?.color || "inherit"}">${item.school}</span>
        | <span>${item.degree}</span>
        | <span>${item.field}</span>
        <span style="float: right;">${item.startDate} - ${item.endDate}</span>
      </div>
      ${item.description ? `<p>${item.description}</p>` : ""}
    </div>
  `,
    )
    .join("");
}

function getWorkModuleHTML(module: WorkModule): string {
  const data = module.data;
  if (!data || data.length === 0) return "";

  return data
    .map(
      (item) => `
    <div style="margin-bottom: 24px;">
      <div>
        <span style="font-weight: ${item.styles?.company?.bold ? "bold" : "normal"}; color: ${item.styles?.company?.color || "inherit"}">${item.company}</span>
        | <span>${item.position}</span>
        <span style="float: right;">${item.startDate} - ${item.endDate}</span>
      </div>
      ${item.description ? `<p>${item.description}</p>` : ""}
    </div>
  `,
    )
    .join("");
}

function getSkillsModuleHTML(module: SkillsModule): string {
  const data = module.data;
  if (!data || data.length === 0) return "";

  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      ${data
        .map(
          (item) => `
        <div style="display: flex; align-items: center;">
          <span style="width: 80px;">${item.name}</span>
          <div style="flex: 1; background: #e5e7eb; height: 8px; border-radius: 9999px;">
            <div style="width: ${(item.level / 5) * 100}%; background: #2563eb; height: 8px; border-radius: 9999px;"></div>
          </div>
          <span style="margin-left: 8px;">${item.level}/5</span>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function getProjectsModuleHTML(module: ProjectsModule): string {
  const data = module.data;
  if (!data || data.length === 0) return "";

  return data
    .map(
      (item) => `
    <div style="margin-bottom: 24px;">
      <p style="font-weight: ${item.styles?.name?.bold ? "bold" : "normal"}; color: ${item.styles?.name?.color || "inherit"}">${item.name}</p>
      ${item.description ? `<p>${item.description}</p>` : ""}
      ${item.technologies ? `<p>${item.technologies.join(", ")}</p>` : ""}
    </div>
  `,
    )
    .join("");
}

function getCustomModuleHTML(module: CustomModule): string {
  const data = module.data;
  if (!data || data.length === 0) return "";

  return data
    .map(
      (item) => `
    <div style="margin-bottom: 16px;">
      ${item.label ? `<p style="font-weight: ${item.styles?.label?.bold ? "bold" : "normal"}; color: ${item.styles?.label?.color || "inherit"}">${item.label}</p>` : ""}
      ${item.content ? `<p>${item.content}</p>` : ""}
    </div>
  `,
    )
    .join("");
}

export default Preview;
