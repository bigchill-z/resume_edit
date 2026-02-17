import React from "react";
import type { Resume } from "../types";
import { Modal, Card, Button, Space, List } from "antd";

interface ResumeListProps {
  resumes: Resume[];
  onSelect: (resume: Resume) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const ResumeList: React.FC<ResumeListProps> = ({
  resumes,
  onSelect,
  onDelete,
  onClose,
}) => {
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      title="简历列表"
      open={true}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
      width={500}
    >
      {/* 简历列表 */}
      <List
        dataSource={resumes}
        locale={{ emptyText: "暂无保存的简历" }}
        renderItem={(resume) => (
          <Card className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800">{resume.name}</h3>
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>创建时间: {formatDate(resume.createdAt)}</p>
                  <p>更新时间: {formatDate(resume.updatedAt)}</p>
                </div>
              </div>
              <Space>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => onSelect(resume)}
                >
                  选择
                </Button>
                <Button danger size="small" onClick={() => onDelete(resume.id)}>
                  删除
                </Button>
              </Space>
            </div>
          </Card>
        )}
      />
    </Modal>
  );
};

export default ResumeList;
