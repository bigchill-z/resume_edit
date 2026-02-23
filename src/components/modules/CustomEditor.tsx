import React from "react";
import { Input, Button, Card, Form, Checkbox } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useListEditor } from "../../hooks/useListEditor";
import StyleControls from "../common/StyleControls";
import type { TextStyle } from "../../types/index";

interface CustomItem {
  id: string;
  label: string;
  content: string;
  labelInline?: boolean;
  styles?: {
    label?: TextStyle;
    content?: TextStyle;
  };
}

interface CustomEditorProps {
  data: CustomItem[];
  onUpdate: (data: CustomItem[]) => void;
  onUpdateItemStyles?: (
    id: string,
    styles: {
      label?: TextStyle;
      content?: TextStyle;
    },
  ) => void;
}

const CustomEditor: React.FC<CustomEditorProps> = ({
  data,
  onUpdate,
  onUpdateItemStyles,
}) => {
  const {
    items,
    handleChange,
    handleAddItem,
    handleRemoveItem,
    handleStyleChange,
  } = useListEditor<CustomItem>({
    initialData: data,
    onUpdate,
    onUpdateItemStyles,
  });

  const handleAddCustomItem = () => {
    handleAddItem({
      label: "",
      content: "",
    });
  };

  return (
    <div className="custom-editor">
      <Form className="space-y-6">
        {items.map((item, index) => (
          <Card key={item.id} className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-800">
                自定义项 #{index + 1}
              </h4>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveItem(item.id)}
              >
                删除
              </Button>
            </div>

            <Form.Item label="标签">
              <Input
                value={item.label}
                onChange={(e) => handleChange(item.id, "label", e.target.value)}
                placeholder="输入标签"
              />
              <div className="mt-2">
                <Checkbox
                  checked={item.labelInline}
                  onChange={(e) =>
                    handleChange(item.id, "labelInline", e.target.checked)
                  }
                >
                  与内容在同一行
                </Checkbox>
              </div>
              <StyleControls
                bold={item.styles?.label?.bold}
                color={item.styles?.label?.color}
                onBoldChange={(checked) =>
                  handleStyleChange(item.id, "label", { bold: checked })
                }
                onColorChange={(color) =>
                  handleStyleChange(item.id, "label", { color })
                }
              />
            </Form.Item>

            <Form.Item label="内容">
              <Input.TextArea
                value={item.content}
                onChange={(e) =>
                  handleChange(item.id, "content", e.target.value)
                }
                placeholder="输入内容"
                rows={3}
              />
              <StyleControls
                bold={item.styles?.content?.bold}
                color={item.styles?.content?.color}
                onBoldChange={(checked) =>
                  handleStyleChange(item.id, "content", { bold: checked })
                }
                onColorChange={(color) =>
                  handleStyleChange(item.id, "content", { color })
                }
              />
            </Form.Item>
          </Card>
        ))}

        <Form.Item>
          <Button type="dashed" block onClick={handleAddCustomItem}>
            + 添加项
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CustomEditor;
