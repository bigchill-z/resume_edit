import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import StyleControls from "../common/StyleControls";
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

  useEffect(() => {
    setFormData(data);
  }, [data]);

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

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newFormData = { ...formData, photo: reader.result as string };
      setFormData(newFormData);
      onUpdate(newFormData);
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <Form className="space-y-4">
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
          <StyleControls
            bold={formStyles.name?.bold}
            color={formStyles.name?.color}
            onBoldChange={(checked) =>
              handleStyleChange("name", { bold: checked })
            }
            onColorChange={(color) => handleStyleChange("name", { color })}
          />
        </Form.Item>

        <Form.Item label="职位">
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="请输入职位"
          />
          <StyleControls
            bold={formStyles.title?.bold}
            color={formStyles.title?.color}
            onBoldChange={(checked) =>
              handleStyleChange("title", { bold: checked })
            }
            onColorChange={(color) => handleStyleChange("title", { color })}
          />
        </Form.Item>

        <Form.Item label="邮箱">
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="请输入邮箱"
          />
          <StyleControls
            bold={formStyles.email?.bold}
            color={formStyles.email?.color}
            onBoldChange={(checked) =>
              handleStyleChange("email", { bold: checked })
            }
            onColorChange={(color) => handleStyleChange("email", { color })}
          />
        </Form.Item>

        <Form.Item label="电话">
          <Input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="请输入电话"
          />
          <StyleControls
            bold={formStyles.phone?.bold}
            color={formStyles.phone?.color}
            onBoldChange={(checked) =>
              handleStyleChange("phone", { bold: checked })
            }
            onColorChange={(color) => handleStyleChange("phone", { color })}
          />
        </Form.Item>

        <Form.Item label="地址">
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="请输入地址"
          />
          <StyleControls
            bold={formStyles.address?.bold}
            color={formStyles.address?.color}
            onBoldChange={(checked) =>
              handleStyleChange("address", { bold: checked })
            }
            onColorChange={(color) => handleStyleChange("address", { color })}
          />
        </Form.Item>

        <Form.Item label="个人简介">
          <Input.TextArea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows={4}
            placeholder="请输入个人简介"
          />
          <StyleControls
            bold={formStyles.summary?.bold}
            color={formStyles.summary?.color}
            onBoldChange={(checked) =>
              handleStyleChange("summary", { bold: checked })
            }
            onColorChange={(color) => handleStyleChange("summary", { color })}
          />
        </Form.Item>
      </Card>
    </Form>
  );
};

export default PersonalEditor;
