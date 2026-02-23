import React from "react";
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
                    style={{ color: item.styles?.school?.color }}
                  >
                    {item.school}
                  </Text>{" "}
                  |{" "}
                  <Text
                    strong={item.styles?.degree?.bold || false}
                    style={{ color: item.styles?.degree?.color }}
                  >
                    {item.degree}
                  </Text>{" "}
                  |{" "}
                  <Text
                    style={{
                      fontWeight: item.styles?.field?.bold ? "bold" : "normal",
                      color: item.styles?.field?.color,
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
                      style={{ color: item.styles?.company?.color }}
                    >
                      {item.company}
                    </Text>{" "}
                    |{" "}
                    <Text
                      strong={item.styles?.position?.bold || false}
                      style={{ color: item.styles?.position?.color }}
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
                    style={{ color: item.styles?.company?.color }}
                  >
                    {item.company}
                  </Text>{" "}
                  |{" "}
                  <Text
                    strong={item.styles?.position?.bold || false}
                    style={{ color: item.styles?.position?.color }}
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

  return (
    <div
      className="max-w-2xl mx-auto"
      style={{
        transform: `scale(${spacing})`,
        transformOrigin: "top center",
        transition: "transform 0.3s ease",
        lineHeight: lineSpacing,
        fontSize: contentFontSize,
      }}
    >
      {sortedModules.map((module) => (
        <div
          key={module.id}
          style={{
            marginBottom: `${2 * moduleSpacing}rem`,
            transition: "margin 0.3s ease",
          }}
        >
          {renderModule(module)}
        </div>
      ))}
    </div>
  );
};

export default Preview;
