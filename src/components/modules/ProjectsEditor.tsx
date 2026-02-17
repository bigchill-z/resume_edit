import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Checkbox, ColorPicker, Space } from "antd";
import { DeleteOutlined, BoldOutlined } from "@ant-design/icons";
import type { TextStyle } from "../../types/index";

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link: string;
  technologies: string[];
}

interface ProjectsEditorProps {
  data: ProjectItem[];
  onUpdate: (data: ProjectItem[]) => void;
  onUpdateItemStyles?: (
    id: string,
    styles: {
      name?: TextStyle;
      description?: TextStyle;
      technologies?: TextStyle;
      link?: TextStyle;
    },
  ) => void;
}

const ProjectsEditor: React.FC<ProjectsEditorProps> = ({
  data,
  onUpdate,
  onUpdateItemStyles,
}) => {
  const [projectItems, setProjectItems] = useState<ProjectItem[]>(data);

  // 监听data props变化，更新projectItems
  useEffect(() => {
    setProjectItems(data);
  }, [data]);

  const handleChange = (
    id: string,
    field: keyof ProjectItem,
    value: string | string[],
  ) => {
    const newProjectItems = projectItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    setProjectItems(newProjectItems);
    onUpdate(newProjectItems);
  };

  const handleAddItem = () => {
    const newItem: ProjectItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
      link: "",
      technologies: [],
    };
    const newProjectItems = [...projectItems, newItem];
    setProjectItems(newProjectItems);
    onUpdate(newProjectItems);
  };

  const handleRemoveItem = (id: string) => {
    const newProjectItems = projectItems.filter((item) => item.id !== id);
    setProjectItems(newProjectItems);
    onUpdate(newProjectItems);
  };

  const handleStyleChange = (
    id: string,
    field: string,
    style: Partial<TextStyle>,
  ) => {
    const newProjectItems = projectItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          styles: {
            ...item.styles,
            [field]: {
              ...item.styles?.[field as string],
              ...style,
            },
          },
        };
      }
      return item;
    });
    setProjectItems(newProjectItems);
    const item = projectItems.find((item) => item.id === id);
    onUpdateItemStyles?.(id, {
      ...item?.styles,
      [field]: {
        ...item?.styles?.[field as string],
        ...style,
      },
    });
  };

  const handleFinish = () => {
    onUpdate(projectItems);
  };

  return (
    <Form onFinish={handleFinish} className="space-y-6">
      {projectItems.map((item) => (
        <Card key={item.id} className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-800">
              项目 #{projectItems.indexOf(item) + 1}
            </h4>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(item.id)}
            />
          </div>

          <Form.Item label="项目名称">
            <Input
              value={item.name}
              onChange={(e) => handleChange(item.id, "name", e.target.value)}
              placeholder="请输入项目名称"
            />
            <Space size="middle" className="mt-2">
              <Checkbox
                checked={item.styles?.name?.bold || false}
                onChange={(e) =>
                  handleStyleChange(item.id, "name", {
                    bold: e.target.checked,
                  })
                }
              >
                <BoldOutlined /> 加粗
              </Checkbox>
              <Space size="small">
                <ColorPicker
                  value={item.styles?.name?.color}
                  onChange={(color) =>
                    handleStyleChange(item.id, "name", {
                      color: color?.toHexString(),
                    })
                  }
                />
                <span>字体颜色</span>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item label="技术栈">
            <Input
              value={
                Array.isArray(item.technologies)
                  ? item.technologies.join(", ")
                  : item.technologies
              }
              onChange={(e) =>
                handleChange(
                  item.id,
                  "technologies",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
              placeholder="例如：React, Node.js, MongoDB"
            />
            <Space size="middle" className="mt-2">
              <Checkbox
                checked={item.styles?.technologies?.bold || false}
                onChange={(e) =>
                  handleStyleChange(item.id, "technologies", {
                    bold: e.target.checked,
                  })
                }
              >
                <BoldOutlined /> 加粗
              </Checkbox>
              <Space size="small">
                <ColorPicker
                  value={item.styles?.technologies?.color}
                  onChange={(color) =>
                    handleStyleChange(item.id, "technologies", {
                      color: color?.toHexString(),
                    })
                  }
                />
                <span>字体颜色</span>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item label="项目描述">
            <Input.TextArea
              value={item.description}
              onChange={(e) =>
                handleChange(item.id, "description", e.target.value)
              }
              rows={3}
              placeholder="请输入项目描述"
            />
            <Space size="middle" className="mt-2">
              <Checkbox
                checked={item.styles?.description?.bold || false}
                onChange={(e) =>
                  handleStyleChange(item.id, "description", {
                    bold: e.target.checked,
                  })
                }
              >
                <BoldOutlined /> 加粗
              </Checkbox>
              <Space size="small">
                <ColorPicker
                  value={item.styles?.description?.color}
                  onChange={(color) =>
                    handleStyleChange(item.id, "description", {
                      color: color?.toHexString(),
                    })
                  }
                />
                <span>字体颜色</span>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item label="项目链接">
            <Input
              type="url"
              value={item.link}
              onChange={(e) => handleChange(item.id, "link", e.target.value)}
              placeholder="请输入项目链接"
            />
            <Space size="middle" className="mt-2">
              <Checkbox
                checked={item.styles?.link?.bold || false}
                onChange={(e) =>
                  handleStyleChange(item.id, "link", {
                    bold: e.target.checked,
                  })
                }
              >
                <BoldOutlined /> 加粗
              </Checkbox>
              <Space size="small">
                <ColorPicker
                  value={item.styles?.link?.color}
                  onChange={(color) =>
                    handleStyleChange(item.id, "link", {
                      color: color?.toHexString(),
                    })
                  }
                />
                <span>字体颜色</span>
              </Space>
            </Space>
          </Form.Item>
        </Card>
      ))}

      <Form.Item>
        <Button type="dashed" block onClick={handleAddItem}>
          + 添加项目
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProjectsEditor;
