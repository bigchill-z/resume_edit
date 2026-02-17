import React from "react";
import { Checkbox, ColorPicker, Space } from "antd";
import { BoldOutlined } from "@ant-design/icons";
import type { TextStyle } from "../../types/index";

interface StyleControlsProps {
  bold?: boolean;
  color?: string;
  onBoldChange?: (checked: boolean) => void;
  onColorChange?: (color: string | undefined) => void;
}

const StyleControls: React.FC<StyleControlsProps> = ({
  bold = false,
  color,
  onBoldChange,
  onColorChange,
}) => {
  return (
    <Space size="middle" className="mt-2">
      <Checkbox
        checked={bold}
        onChange={(e) => onBoldChange?.(e.target.checked)}
      >
        <BoldOutlined /> 加粗
      </Checkbox>
      <Space size="small">
        <ColorPicker
          value={color}
          onChange={(c) => onColorChange?.(c?.toHexString())}
        />
        <span>字体颜色</span>
      </Space>
    </Space>
  );
};

export default StyleControls;
