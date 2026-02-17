// 导出数据为JSON文件
export const exportToJSON = (data: unknown, fileName: string = 'resume.json') => {
  try {
    // 将数据转换为JSON字符串
    const jsonString = JSON.stringify(data, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // 触发下载
    link.click();
    
    // 清理
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting JSON:', error);
    return false;
  }
};

// 从JSON文件导入数据
export const importFromJSON = (file: File): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    try {
      // 创建文件读取器
      const reader = new FileReader();
      
      // 读取文件完成时的处理
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const data = JSON.parse(jsonString);
          resolve(data);
        } catch {
          reject(new Error('Invalid JSON file'));
        }
      };
      
      // 读取文件错误时的处理
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      // 开始读取文件
      reader.readAsText(file);
    } catch {
      reject(new Error('Error reading file'));
    }
  });
};