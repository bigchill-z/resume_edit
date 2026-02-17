import type { Resume } from '../types';

const STORAGE_KEY = 'resume_editor_resumes';

// 获取所有简历
export const getAllResumes = (): Resume[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting resumes from storage:', error);
    return [];
  }
};

// 别名，保持向后兼容性
export const getResumes = getAllResumes;

// 获取单个简历
export const getResume = (id: string): Resume | null => {
  try {
    const resumes = getAllResumes();
    return resumes.find(resume => resume.id === id) || null;
  } catch (error) {
    console.error('Error getting resume from storage:', error);
    return null;
  }
};

// 保存简历
export const saveResume = (resume: Resume): boolean => {
  try {
    const resumes = getAllResumes();
    const existingIndex = resumes.findIndex(r => r.id === resume.id);
    
    if (existingIndex >= 0) {
      // 更新现有简历
      resumes[existingIndex] = {
        ...resume,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // 添加新简历
      resumes.push({
        ...resume,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    return true;
  } catch (error) {
    console.error('Error saving resume to storage:', error);
    return false;
  }
};

// 删除简历
export const deleteResume = (id: string): boolean => {
  try {
    const resumes = getAllResumes();
    const filteredResumes = resumes.filter(resume => resume.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredResumes));
    return true;
  } catch (error) {
    console.error('Error deleting resume from storage:', error);
    return false;
  }
};

// 清空所有简历
export const clearAllResumes = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing resumes from storage:', error);
    return false;
  }
};