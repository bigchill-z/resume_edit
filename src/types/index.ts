// 模块类型定义
export type ModuleType =
  | "personal"
  | "education"
  | "work"
  | "skills"
  | "projects"
  | "custom";

// 模块来源类型
export type ModuleSource = "original" | "copied" | "custom";

// 基础模块接口
export interface BaseModule {
  id: string;
  type: ModuleType;
  title: string;
  visible: boolean;
  order: number;
  source?: ModuleSource;
}

// 文本样式接口
export interface TextStyle {
  bold?: boolean;
  color?: string;
}

// 个人信息模块
export interface PersonalModule extends BaseModule {
  type: "personal";
  data: {
    name: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    photo: string;
  };
  styles?: {
    name?: TextStyle;
    title?: TextStyle;
    email?: TextStyle;
    phone?: TextStyle;
    address?: TextStyle;
    summary?: TextStyle;
  };
}

// 教育背景项
export interface EducationItem {
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

// 教育背景模块
export interface EducationModule extends BaseModule {
  type: "education";
  data: EducationItem[];
}

// 工作经验项
export interface WorkItem {
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

// 工作经验模块
export interface WorkModule extends BaseModule {
  type: "work";
  data: WorkItem[];
}

// 技能项
export interface SkillItem {
  id: string;
  name: string;
  level: number; // 1-5
}

// 技能模块
export interface SkillsModule extends BaseModule {
  type: "skills";
  data: SkillItem[];
}

// 项目经历项
export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
  styles?: {
    name?: TextStyle;
    description?: TextStyle;
    technologies?: TextStyle;
    link?: TextStyle;
  };
}

// 项目经历模块
export interface ProjectsModule extends BaseModule {
  type: "projects";
  data: ProjectItem[];
}

// 自定义模块项
export interface CustomItem {
  id: string;
  label: string;
  content: string;
  styles?: {
    label?: TextStyle;
    content?: TextStyle;
  };
}

// 自定义模块
export interface CustomModule extends BaseModule {
  type: "custom";
  data: CustomItem[];
}

// 所有模块类型的联合类型
export type ResumeModule =
  | PersonalModule
  | EducationModule
  | WorkModule
  | SkillsModule
  | ProjectsModule
  | CustomModule;

// 简历数据结构
export interface Resume {
  id: string;
  name: string;
  modules: ResumeModule[];
  createdAt: string;
  updatedAt: string;
}

// 简历列表项
export interface ResumeListItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// 简历存储
export interface ResumeStorage {
  resumes: Resume[];
  currentResumeId: string | null;
}
