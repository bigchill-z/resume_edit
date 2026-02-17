import React from "react";
import { Form, Input, Button, Card, Checkbox, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useListEditor } from "../../hooks/useListEditor";
import StyleControls from "../common/StyleControls";
import type { TextStyle } from "../../types/index";

interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  dateRightAlign?: boolean;
  styles?: {
    school?: TextStyle;
    degree?: TextStyle;
    field?: TextStyle;
    date?: TextStyle;
    description?: TextStyle;
  };
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
  const {
    items: educationItems,
    handleChange,
    handleAddItem,
    handleRemoveItem,
    handleStyleChange,
  } = useListEditor<EducationItem>({
    initialData: data,
    onUpdate,
    onUpdateItemStyles,
  });

  const handleDateRightAlignChange = (id: string, checked: boolean) => {
    const newItems = educationItems.map((item) => {
      if (item.id === id) {
        return { ...item, dateRightAlign: checked };
      }
      return item;
    });
    onUpdate(newItems);
    onUpdateItemDateAlign?.(id, checked);
  };

  const handleAddEducationItem = () => {
    handleAddItem({
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  return (
    <Form className="space-y-6">
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
            <StyleControls
              bold={item.styles?.school?.bold}
              color={item.styles?.school?.color}
              onBoldChange={(checked) =>
                handleStyleChange(item.id, "school", { bold: checked })
              }
              onColorChange={(color) =>
                handleStyleChange(item.id, "school", { color })
              }
            />
          </Form.Item>

          <Form.Item label="学位">
            <Input
              value={item.degree}
              onChange={(e) => handleChange(item.id, "degree", e.target.value)}
              placeholder="请输入学位"
            />
            <StyleControls
              bold={item.styles?.degree?.bold}
              color={item.styles?.degree?.color}
              onBoldChange={(checked) =>
                handleStyleChange(item.id, "degree", { bold: checked })
              }
              onColorChange={(color) =>
                handleStyleChange(item.id, "degree", { color })
              }
            />
          </Form.Item>

          <Form.Item label="专业">
            <Input
              value={item.field}
              onChange={(e) => handleChange(item.id, "field", e.target.value)}
              placeholder="请输入专业"
            />
            <StyleControls
              bold={item.styles?.field?.bold}
              color={item.styles?.field?.color}
              onBoldChange={(checked) =>
                handleStyleChange(item.id, "field", { bold: checked })
              }
              onColorChange={(color) =>
                handleStyleChange(item.id, "field", { color })
              }
            />
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
        <Button type="dashed" block onClick={handleAddEducationItem}>
          + 添加教育经历
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EducationEditor;
