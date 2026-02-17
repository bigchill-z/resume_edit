import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Checkbox, ColorPicker, Space } from "antd";
import { DeleteOutlined, BoldOutlined } from "@ant-design/icons";
import type { TextStyle } from "../../types/index";

interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationEditorProps {
  data: EducationItem[];
  onUpdate: (data: EducationItem[]) => void;
  onUpdateItemStyles?: (
    id: string,
    styles: {
      school?: TextStyle;
      degree?: TextStyle;
      field?: TextStyle;
      date?: TextStyle;
      description?: TextStyle;
    },
  ) => void;
  onUpdateItemDateAlign?: (id: string, dateRightAlign: boolean) => void;
}

const EducationEditor: React.FC<EducationEditorProps> = ({
  data,
  onUpdate,
  onUpdateItemStyles,
  onUpdateItemDateAlign,
}) => {
  const [educationItems, setEducationItems] = useState<EducationItem[]>(data);

  // 监听data props变化，更新educationItems
  useEffect(() => {
    setEducationItems(data);
  }, [data]);

  const handleChange = (
    id: string,
    field: keyof EducationItem,
    value: string,
  ) => {
    const newEducationItems = educationItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    setEducationItems(newEducationItems);
    onUpdate(newEducationItems);
  };

  const handleAddItem = () => {
    const newItem: EducationItem = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    const newEducationItems = [...educationItems, newItem];
    setEducationItems(newEducationItems);
    onUpdate(newEducationItems);
  };

  const handleRemoveItem = (id: string) => {
    const newEducationItems = educationItems.filter((item) => item.id !== id);
    setEducationItems(newEducationItems);
    onUpdate(newEducationItems);
  };

  const handleStyleChange = (
    id: string,
    field: string,
    style: Partial<TextStyle>,
  ) => {
    const newEducationItems = educationItems.map((item) => {
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
    setEducationItems(newEducationItems);
    const item = educationItems.find((item) => item.id === id);
    onUpdateItemStyles?.(id, {
      ...item?.styles,
      [field]: {
        ...item?.styles?.[field as string],
        ...style,
      },
    });
  };

  const handleDateRightAlignChange = (id: string, checked: boolean) => {
    const newEducationItems = educationItems.map((item) => {
      if (item.id === id) {
        return { ...item, dateRightAlign: checked };
      }
      return item;
    });
    setEducationItems(newEducationItems);
    onUpdate(newEducationItems);
    onUpdateItemDateAlign?.(id, checked);
  };

  const handleFinish = () => {
    onUpdate(educationItems);
  };

  return (
    <Form onFinish={handleFinish} className="space-y-6">
      {educationItems.map((item) => (
        <Card key={item.id} className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-800">
              教育经历 #{educationItems.indexOf(item) + 1}
            </h4>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(item.id)}
            />
          </div>

          <Form.Item label="学校">
            <Input
              value={item.school}
              onChange={(e) => handleChange(item.id, "school", e.target.value)}
              placeholder="请输入学校"
            />
            <Space size="middle" className="mt-2">
              <Checkbox
                checked={item.styles?.school?.bold || false}
                onChange={(e) =>
                  handleStyleChange(item.id, "school", {
                    bold: e.target.checked,
                  })
                }
              >
                <BoldOutlined /> 加粗
              </Checkbox>
              <Space size="small">
                <ColorPicker
                  value={item.styles?.school?.color}
                  onChange={(color) =>
                    handleStyleChange(item.id, "school", {
                      color: color?.toHexString(),
                    })
                  }
                />
                <span>字体颜色</span>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item label="学位">
            <Input
              value={item.degree}
              onChange={(e) => handleChange(item.id, "degree", e.target.value)}
              placeholder="请输入学位"
            />
            <Space size="middle" className="mt-2">
              <Checkbox
                checked={item.styles?.degree?.bold || false}
                onChange={(e) =>
                  handleStyleChange(item.id, "degree", {
                    bold: e.target.checked,
                  })
                }
              >
                <BoldOutlined /> 加粗
              </Checkbox>
              <Space size="small">
                <ColorPicker
                  value={item.styles?.degree?.color}
                  onChange={(color) =>
                    handleStyleChange(item.id, "degree", {
                      color: color?.toHexString(),
                    })
                  }
                />
                <span>字体颜色</span>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item label="专业">
            <Input
              value={item.field}
              onChange={(e) => handleChange(item.id, "field", e.target.value)}
              placeholder="请输入专业"
            />
            <Space size="middle" className="mt-2">
              <Checkbox
                checked={item.styles?.field?.bold || false}
                onChange={(e) =>
                  handleStyleChange(item.id, "field", {
                    bold: e.target.checked,
                  })
                }
              >
                <BoldOutlined /> 加粗
              </Checkbox>
              <Space size="small">
                <ColorPicker
                  value={item.styles?.field?.color}
                  onChange={(color) =>
                    handleStyleChange(item.id, "field", {
                      color: color?.toHexString(),
                    })
                  }
                />
                <span>字体颜色</span>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item label="开始日期">
            <Input
              value={item.startDate}
              onChange={(e) =>
                handleChange(item.id, "startDate", e.target.value)
              }
              placeholder="例如：2015-09"
            />
          </Form.Item>

          <Form.Item label="结束日期">
            <Input
              value={item.endDate}
              onChange={(e) => handleChange(item.id, "endDate", e.target.value)}
              placeholder="例如：2019-06"
            />
          </Form.Item>

          <Form.Item label="日期样式">
            <Space size="middle">
              <Checkbox
                checked={item.styles?.date?.bold || false}
                onChange={(e) =>
                  handleStyleChange(item.id, "date", {
                    bold: e.target.checked,
                  })
                }
              >
                <BoldOutlined /> 加粗
              </Checkbox>
              <Space size="small">
                <ColorPicker
                  value={item.styles?.date?.color}
                  onChange={(color) =>
                    handleStyleChange(item.id, "date", {
                      color: color?.toHexString(),
                    })
                  }
                />
                <span>字体颜色</span>
              </Space>
              <Checkbox
                checked={item.dateRightAlign || false}
                onChange={(e) =>
                  handleDateRightAlignChange(item.id, e.target.checked)
                }
              >
                日期紧靠右边
              </Checkbox>
            </Space>
          </Form.Item>

          <Form.Item label="描述">
            <Input.TextArea
              value={item.description}
              onChange={(e) =>
                handleChange(item.id, "description", e.target.value)
              }
              rows={4}
              placeholder="请输入描述"
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
        </Card>
      ))}

      <Form.Item>
        <Button type="dashed" block onClick={handleAddItem}>
          + 添加教育经历
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EducationEditor;
