import React from "react";
import { Form, Input, Button, Card } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useListEditor } from "../../hooks/useListEditor";
import StyleControls from "../common/StyleControls";
import type { TextStyle } from "../../types/index";

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link: string;
  technologies: string[];
  styles?: {
    name?: TextStyle;
    description?: TextStyle;
    technologies?: TextStyle;
    link?: TextStyle;
  };
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
  const {
    items: projectItems,
    handleChange,
    handleAddItem,
    handleRemoveItem,
    handleStyleChange,
  } = useListEditor<ProjectItem>({
    initialData: data,
    onUpdate,
    onUpdateItemStyles,
  });

  const handleAddProjectItem = () => {
    handleAddItem({
      name: "",
      description: "",
      link: "",
      technologies: [],
    });
  };

  return (
    <Form className="space-y-6">
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
            <StyleControls
              bold={item.styles?.name?.bold}
              color={item.styles?.name?.color}
              onBoldChange={(checked) =>
                handleStyleChange(item.id, "name", { bold: checked })
              }
              onColorChange={(color) =>
                handleStyleChange(item.id, "name", { color })
              }
            />
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
            <StyleControls
              bold={item.styles?.technologies?.bold}
              color={item.styles?.technologies?.color}
              onBoldChange={(checked) =>
                handleStyleChange(item.id, "technologies", { bold: checked })
              }
              onColorChange={(color) =>
                handleStyleChange(item.id, "technologies", { color })
              }
            />
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
            <StyleControls
              bold={item.styles?.description?.bold}
              color={item.styles?.description?.color}
              onBoldChange={(checked) =>
                handleStyleChange(item.id, "description", { bold: checked })
              }
              onColorChange={(color) =>
                handleStyleChange(item.id, "description", { color })
              }
            />
          </Form.Item>

          <Form.Item label="项目链接">
            <Input
              type="url"
              value={item.link}
              onChange={(e) => handleChange(item.id, "link", e.target.value)}
              placeholder="请输入项目链接"
            />
            <StyleControls
              bold={item.styles?.link?.bold}
              color={item.styles?.link?.color}
              onBoldChange={(checked) =>
                handleStyleChange(item.id, "link", { bold: checked })
              }
              onColorChange={(color) =>
                handleStyleChange(item.id, "link", { color })
              }
            />
          </Form.Item>
        </Card>
      ))}

      <Form.Item>
        <Button type="dashed" block onClick={handleAddProjectItem}>
          + 添加项目
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProjectsEditor;
