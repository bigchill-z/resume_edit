import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Upload,
  Checkbox,
  ColorPicker,
  Space,
} from "antd";
import { UploadOutlined, BoldOutlined } from "@ant-design/icons";
import type { TextStyle } from "../../types/index";

interface PersonalData {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  photo: string;
}

interface PersonalEditorProps {
  data: PersonalData;
  onUpdate: (data: PersonalData) => void;
  styles?: {
    name?: TextStyle;
    title?: TextStyle;
    email?: TextStyle;
    phone?: TextStyle;
    address?: TextStyle;
    summary?: TextStyle;
  };
  onUpdateStyles?: (styles: {
    name?: TextStyle;
    title?: TextStyle;
    email?: TextStyle;
    phone?: TextStyle;
    address?: TextStyle;
    summary?: TextStyle;
  }) => void;
}

const PersonalEditor: React.FC<PersonalEditorProps> = ({
  data,
  onUpdate,
  styles = {},
  onUpdateStyles,
}) => {
  const [formData, setFormData] = useState<PersonalData>(data);
  const [formStyles, setFormStyles] = useState<{
    name?: TextStyle;
    title?: TextStyle;
    email?: TextStyle;
    phone?: TextStyle;
    address?: TextStyle;
    summary?: TextStyle;
  }>(styles);

  // 监听data props变化，更新formData
  useEffect(() => {
    setFormData(data);
  }, [data]);

  // 监听styles props变化，更新formStyles
  useEffect(() => {
    setFormStyles(styles);
  }, [styles]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    onUpdate(newFormData);
  };

  const handleStyleChange = (field: string, style: Partial<TextStyle>) => {
    const newFormStyles = {
      ...formStyles,
      [field]: {
        ...formStyles[field as keyof typeof formStyles],
        ...style,
      },
    };
    setFormStyles(newFormStyles);
    onUpdateStyles?.(newFormStyles);
  };

  const handleFinish = () => {
    onUpdate(formData);
  };

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newFormData = { ...formData, photo: reader.result as string };
      setFormData(newFormData);
      onUpdate(newFormData);
    };
    reader.readAsDataURL(file);
    return false; // 阻止自动上传
  };

  return (
    <Form onFinish={handleFinish} className="space-y-4">
      <Card className="mb-4" style={{ overflow: "hidden" }}>
        <Form.Item label="证件照">
          <div
            className="flex items-center space-x-4"
            style={{ maxWidth: "100%" }}
          >
            <div
              className="flex-shrink-0 w-24 h-24 border border-gray-300 overflow-hidden rounded"
              style={{ flexBasis: "6rem", flexGrow: 0, flexShrink: 0 }}
            >
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="证件照"
                  className="w-full h-full object-cover"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">无照片</span>
                </div>
              )}
            </div>
            <Upload
              name="photo"
              accept="image/*"
              showUploadList={false}
              customRequest={({ file }) => handlePhotoUpload(file)}
              style={{ flexShrink: 0 }}
            >
              <Button icon={<UploadOutlined />}>上传证件照</Button>
            </Upload>
          </div>
        </Form.Item>
      </Card>

      <Card className="mb-4">
        <Form.Item label="姓名">
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="请输入姓名"
          />
          <Space size="middle" className="mt-2">
            <Checkbox
              checked={formStyles.name?.bold || false}
              onChange={(e) =>
                handleStyleChange("name", { bold: e.target.checked })
              }
            >
              <BoldOutlined /> 加粗
            </Checkbox>
            <Space size="small">
              <ColorPicker
                value={formStyles.name?.color}
                onChange={(color) =>
                  handleStyleChange("name", { color: color?.toHexString() })
                }
              />
              <span>字体颜色</span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item label="职位">
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="请输入职位"
          />
          <Space size="middle" className="mt-2">
            <Checkbox
              checked={formStyles.title?.bold || false}
              onChange={(e) =>
                handleStyleChange("title", { bold: e.target.checked })
              }
            >
              <BoldOutlined /> 加粗
            </Checkbox>
            <Space size="small">
              <ColorPicker
                value={formStyles.title?.color}
                onChange={(color) =>
                  handleStyleChange("title", { color: color?.toHexString() })
                }
              />
              <span>字体颜色</span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item label="邮箱">
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="请输入邮箱"
          />
          <Space size="middle" className="mt-2">
            <Checkbox
              checked={formStyles.email?.bold || false}
              onChange={(e) =>
                handleStyleChange("email", { bold: e.target.checked })
              }
            >
              <BoldOutlined /> 加粗
            </Checkbox>
            <Space size="small">
              <ColorPicker
                value={formStyles.email?.color}
                onChange={(color) =>
                  handleStyleChange("email", { color: color?.toHexString() })
                }
              />
              <span>字体颜色</span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item label="电话">
          <Input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="请输入电话"
          />
          <Space size="middle" className="mt-2">
            <Checkbox
              checked={formStyles.phone?.bold || false}
              onChange={(e) =>
                handleStyleChange("phone", { bold: e.target.checked })
              }
            >
              <BoldOutlined /> 加粗
            </Checkbox>
            <Space size="small">
              <ColorPicker
                value={formStyles.phone?.color}
                onChange={(color) =>
                  handleStyleChange("phone", { color: color?.toHexString() })
                }
              />
              <span>字体颜色</span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item label="地址">
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="请输入地址"
          />
          <Space size="middle" className="mt-2">
            <Checkbox
              checked={formStyles.address?.bold || false}
              onChange={(e) =>
                handleStyleChange("address", { bold: e.target.checked })
              }
            >
              <BoldOutlined /> 加粗
            </Checkbox>
            <Space size="small">
              <ColorPicker
                value={formStyles.address?.color}
                onChange={(color) =>
                  handleStyleChange("address", { color: color?.toHexString() })
                }
              />
              <span>字体颜色</span>
            </Space>
          </Space>
        </Form.Item>

        <Form.Item label="个人简介">
          <Input.TextArea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows={4}
            placeholder="请输入个人简介"
          />
          <Space size="middle" className="mt-2">
            <Checkbox
              checked={formStyles.summary?.bold || false}
              onChange={(e) =>
                handleStyleChange("summary", { bold: e.target.checked })
              }
            >
              <BoldOutlined /> 加粗
            </Checkbox>
            <Space size="small">
              <ColorPicker
                value={formStyles.summary?.color}
                onChange={(color) =>
                  handleStyleChange("summary", { color: color?.toHexString() })
                }
              />
              <span>字体颜色</span>
            </Space>
          </Space>
        </Form.Item>
      </Card>
    </Form>
  );
};

export default PersonalEditor;
