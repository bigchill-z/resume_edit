import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Checkbox, ColorPicker, Space } from "antd";
import { DeleteOutlined, BoldOutlined } from "@ant-design/icons";
import type { TextStyle } from "../../types/index";

interface WorkItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface WorkEditorProps {
  data: WorkItem[];
  onUpdate: (data: WorkItem[]) => void;
  onUpdateItemStyles?: (
    id: string,
    styles: {
      company?: TextStyle;
      position?: TextStyle;
      date?: TextStyle;
      description?: TextStyle;
    },
  ) => void;
  onUpdateItemDateAlign?: (id: string, dateRightAlign: boolean) => void;
}

const WorkEditor: React.FC<WorkEditorProps> = ({
  data,
  onUpdate,
  onUpdateItemStyles,
  onUpdateItemDateAlign,
}) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(data);

  // 监听data props变化，更新workItems
  useEffect(() => {
    setWorkItems(data);
  }, [data]);

  const handleChange = (id: string, field: keyof WorkItem, value: string) => {
    const newWorkItems = workItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    setWorkItems(newWorkItems);
    onUpdate(newWorkItems);
  };

  const handleAddItem = () => {
    const newItem: WorkItem = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    const newWorkItems = [...workItems, newItem];
    setWorkItems(newWorkItems);
    onUpdate(newWorkItems);
  };

  const handleRemoveItem = (id: string) => {
    const newWorkItems = workItems.filter((item) => item.id !== id);
    setWorkItems(newWorkItems);
    onUpdate(newWorkItems);
  };

  const handleStyleChange = (
    id: string,
    field: string,
    style: Partial<TextStyle>,
  ) => {
    const newWorkItems = workItems.map((item) => {
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
    setWorkItems(newWorkItems);
    const item = workItems.find((item) => item.id === id);
    onUpdateItemStyles?.(id, {
      ...item?.styles,
      [field]: {
        ...item?.styles?.[field as string],
        ...style,
      },
    });
  };

  const handleDateRightAlignChange = (id: string, checked: boolean) => {
    const newWorkItems = workItems.map((item) => {
      if (item.id === id) {
        return { ...item, dateRightAlign: checked };
      }
      return item;
    });
    setWorkItems(newWorkItems);
    onUpdate(newWorkItems);
    onUpdateItemDateAlign?.(id, checked);
  };

  const handleFinish = () => {
    onUpdate(workItems);
  };

  return (
    <Form onFinish={handleFinish} className="space-y-6">
      {workItems.map((item) => (
        <Card key={item.id} className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-800">
              工作经历 #{workItems.indexOf(item) + 1}
            </h4>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(item.id)}
            />
          </div>

          <Form.Item label="公司">
            <Input
              value={item.company}
              onChange={(e) => handleChange(item.id, "company", e.target.value)}
              placeholder="请输入公司"
            />
            <Space size="middle" className="mt-2">
              <Checkbox
                checked={item.styles?.company?.bold || false}
                onChange={(e) =>
                  handleStyleChange(item.id, "company", {
                    bold: e.target.checked,
                  })
                }
              >
                <BoldOutlined /> 加粗
              </Checkbox>
              <Space size="small">
                <ColorPicker
                  value={item.styles?.company?.color}
                  onChange={(color) =>
                    handleStyleChange(item.id, "company", {
                      color: color?.toHexString(),
                    })
                  }
                />
                <span>字体颜色</span>
              </Space>
            </Space>
          </Form.Item>

          <Form.Item label="职位">
            <Input
              value={item.position}
              onChange={(e) =>
                handleChange(item.id, "position", e.target.value)
              }
              placeholder="请输入职位"
            />
            <Space size="middle" className="mt-2">
              <Checkbox
                checked={item.styles?.position?.bold || false}
                onChange={(e) =>
                  handleStyleChange(item.id, "position", {
                    bold: e.target.checked,
                  })
                }
              >
                <BoldOutlined /> 加粗
              </Checkbox>
              <Space size="small">
                <ColorPicker
                  value={item.styles?.position?.color}
                  onChange={(color) =>
                    handleStyleChange(item.id, "position", {
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
              placeholder="例如：2019-07"
            />
          </Form.Item>

          <Form.Item label="结束日期">
            <Input
              value={item.endDate}
              onChange={(e) => handleChange(item.id, "endDate", e.target.value)}
              placeholder="例如：2022-03"
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
          + 添加工作经历
        </Button>
      </Form.Item>
    </Form>
  );
};

export default WorkEditor;
