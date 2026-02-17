import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Row, Col } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

interface SkillItem {
  id: string;
  name: string;
  level: number;
}

interface SkillsEditorProps {
  data: SkillItem[];
  onUpdate: (data: SkillItem[]) => void;
}

const SkillsEditor: React.FC<SkillsEditorProps> = ({ data, onUpdate }) => {
  const [skillItems, setSkillItems] = useState<SkillItem[]>(data);

  // 监听data props变化，更新skillItems
  useEffect(() => {
    setSkillItems(data);
  }, [data]);

  const handleChange = (
    id: string,
    field: keyof SkillItem,
    value: string | number,
  ) => {
    const newSkillItems = skillItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    setSkillItems(newSkillItems);
    onUpdate(newSkillItems);
  };

  const handleAddItem = () => {
    const newItem: SkillItem = {
      id: Date.now().toString(),
      name: "",
      level: 1,
    };
    const newSkillItems = [...skillItems, newItem];
    setSkillItems(newSkillItems);
    onUpdate(newSkillItems);
  };

  const handleRemoveItem = (id: string) => {
    const newSkillItems = skillItems.filter((item) => item.id !== id);
    setSkillItems(newSkillItems);
    onUpdate(newSkillItems);
  };

  const handleFinish = () => {
    onUpdate(skillItems);
  };

  return (
    <Form onFinish={handleFinish} className="space-y-6">
      {skillItems.map((item) => (
        <Card key={item.id} className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-800">
              技能 #{skillItems.indexOf(item) + 1}
            </h4>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(item.id)}
            />
          </div>

          <Row gutter={[16, 16]}>
            <Col span={24} md={12}>
              <Form.Item label="技能名称">
                <Input
                  value={item.name}
                  onChange={(e) =>
                    handleChange(item.id, "name", e.target.value)
                  }
                  placeholder="请输入技能名称"
                />
              </Form.Item>
            </Col>

            <Col span={24} md={12}>
              <Form.Item label="熟练程度">
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={item.level}
                  onChange={(e) =>
                    handleChange(
                      item.id,
                      "level",
                      parseInt(e.target.value) || 1,
                    )
                  }
                  placeholder="1-5"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ))}

      <Form.Item>
        <Button type="dashed" block onClick={handleAddItem}>
          + 添加技能
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SkillsEditor;
