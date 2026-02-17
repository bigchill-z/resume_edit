import React from "react";
import { Input, Button, Card, Form, Checkbox, ColorPicker, Space } from "antd";
import { DeleteOutlined, BoldOutlined } from "@ant-design/icons";
import type { TextStyle } from "../../types/index";

interface CustomItem {
  id: string;
  label: string;
  content: string;
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
  // 添加新项
  const addItem = () => {
    const newItem: CustomItem = {
      id: `custom-item-${Date.now()}`,
      label: "",
      content: "",
    };
    onUpdate([...data, newItem]);
  };

  // 删除项
  const removeItem = (id: string) => {
    onUpdate(data.filter((item) => item.id !== id));
  };

  // 更新项
  const updateItem = (id: string, field: keyof CustomItem, value: string) => {
    onUpdate(
      data.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  // 更新项样式
  const updateItemStyles = (
    id: string,
    field: string,
    style: Partial<TextStyle>,
  ) => {
    const updatedData = data.map((item) => {
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
    onUpdate(updatedData);
    const item = data.find((item) => item.id === id);
    onUpdateItemStyles?.(id, {
      ...item?.styles,
      [field]: {
        ...item?.styles?.[field as string],
        ...style,
      },
    });
  };

  return (
    <div className="custom-editor">
      <Form className="space-y-6">
        {data.map((item, index) => (
          <Card key={item.id} className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-800">
                自定义项 #{index + 1}
              </h4>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeItem(item.id)}
              >
                删除
              </Button>
            </div>

            <Form.Item label="标签">
              <Input
                value={item.label}
                onChange={(e) => updateItem(item.id, "label", e.target.value)}
                placeholder="输入标签"
              />
              <Space size="middle" className="mt-2">
                <Checkbox
                  checked={item.styles?.label?.bold || false}
                  onChange={(e) =>
                    updateItemStyles(item.id, "label", {
                      bold: e.target.checked,
                    })
                  }
                >
                  <BoldOutlined /> 加粗
                </Checkbox>
                <Space size="small">
                  <ColorPicker
                    value={item.styles?.label?.color}
                    onChange={(color) =>
                      updateItemStyles(item.id, "label", {
                        color: color?.toHexString(),
                      })
                    }
                  />
                  <span>字体颜色</span>
                </Space>
              </Space>
            </Form.Item>

            <Form.Item label="内容">
              <Input.TextArea
                value={item.content}
                onChange={(e) => updateItem(item.id, "content", e.target.value)}
                placeholder="输入内容"
                rows={3}
              />
              <Space size="middle" className="mt-2">
                <Checkbox
                  checked={item.styles?.content?.bold || false}
                  onChange={(e) =>
                    updateItemStyles(item.id, "content", {
                      bold: e.target.checked,
                    })
                  }
                >
                  <BoldOutlined /> 加粗
                </Checkbox>
                <Space size="small">
                  <ColorPicker
                    value={item.styles?.content?.color}
                    onChange={(color) =>
                      updateItemStyles(item.id, "content", {
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
          <Button type="dashed" block onClick={addItem}>
            + 添加项
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CustomEditor;
