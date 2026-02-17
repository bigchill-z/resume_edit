import React from "react";
import { Form, Input, Button, Card, Checkbox, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useListEditor } from "../../hooks/useListEditor";
import StyleControls from "../common/StyleControls";
import type { TextStyle } from "../../types/index";

interface WorkItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  dateRightAlign?: boolean;
  styles?: {
    company?: TextStyle;
    position?: TextStyle;
    date?: TextStyle;
    description?: TextStyle;
  };
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
  const {
    items: workItems,
    handleChange,
    handleAddItem,
    handleRemoveItem,
    handleStyleChange,
  } = useListEditor<WorkItem>({
    initialData: data,
    onUpdate,
    onUpdateItemStyles,
  });

  const handleDateRightAlignChange = (id: string, checked: boolean) => {
    const newItems = workItems.map((item) => {
      if (item.id === id) {
        return { ...item, dateRightAlign: checked };
      }
      return item;
    });
    onUpdate(newItems);
    onUpdateItemDateAlign?.(id, checked);
  };

  const handleAddWorkItem = () => {
    handleAddItem({
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  return (
    <Form className="space-y-6">
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
            <StyleControls
              bold={item.styles?.company?.bold}
              color={item.styles?.company?.color}
              onBoldChange={(checked) =>
                handleStyleChange(item.id, "company", { bold: checked })
              }
              onColorChange={(color) =>
                handleStyleChange(item.id, "company", { color })
              }
            />
          </Form.Item>

          <Form.Item label="职位">
            <Input
              value={item.position}
              onChange={(e) =>
                handleChange(item.id, "position", e.target.value)
              }
              placeholder="请输入职位"
            />
            <StyleControls
              bold={item.styles?.position?.bold}
              color={item.styles?.position?.color}
              onBoldChange={(checked) =>
                handleStyleChange(item.id, "position", { bold: checked })
              }
              onColorChange={(color) =>
                handleStyleChange(item.id, "position", { color })
              }
            />
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
              <StyleControls
                bold={item.styles?.date?.bold}
                color={item.styles?.date?.color}
                onBoldChange={(checked) =>
                  handleStyleChange(item.id, "date", { bold: checked })
                }
                onColorChange={(color) =>
                  handleStyleChange(item.id, "date", { color })
                }
              />
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
        </Card>
      ))}

      <Form.Item>
        <Button type="dashed" block onClick={handleAddWorkItem}>
          + 添加工作经历
        </Button>
      </Form.Item>
    </Form>
  );
};

export default WorkEditor;
