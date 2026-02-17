import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * 导出简历为PDF
 * @param elementId 要导出的DOM元素ID
 * @param fileName 导出的PDF文件名
 */
export const exportToPDF = async (
  elementId: string,
  fileName: string = "resume.pdf",
) => {
  try {
    // 获取要导出的DOM元素
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id ${elementId} not found`);
    }

    // 保存原始样式
    const originalStyle = element.style.cssText;

    // 临时移除边框样式
    element.style.border = "none";
    element.style.boxShadow = "none";

    // 使用html2canvas将DOM元素转换为canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 提高分辨率
      useCORS: true, // 允许加载跨域图片
      logging: false,
      backgroundColor: "#ffffff",
    });

    // 恢复原始样式
    element.style.cssText = originalStyle;

    // 创建PDF实例
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // 计算PDF页面尺寸和canvas尺寸
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 计算缩放比例
    const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);

    // 计算canvas在PDF中的位置
    const offsetX = (pdfWidth - canvasWidth * ratio) / 2;
    const offsetY = 10; // 顶部边距

    // 将canvas添加到PDF中
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      offsetX,
      offsetY,
      canvasWidth * ratio,
      canvasHeight * ratio,
    );

    // 保存PDF
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    return false;
  }
};
