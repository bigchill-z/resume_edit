import axios from "axios";

const http = axios.create({ baseURL: "/", timeout: 60000 });

http.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
);

export const getDetail = (resumeId) =>
  http.get("/api/resume/online/detail", { params: { resumeId } });

export const getResumeList = () => http.get("/api/resume/online/list");

export const createResume = (tplId) =>
  http.post("/api/resume/online/create", tplId ? { tplId } : {});

export const copyResume = (resumeId) =>
  http.post("/api/resume/online/copy", { resumeId });

export const renameResume = (resumeId, name) =>
  http.post("/api/resume/online/rename", { resumeId, name });

export const deleteResume = (resumeId) =>
  http.post("/api/resume/online/delete", { resumeId });

export const updateBasic = (resumeId, basicInfo) =>
  http.post("/api/resume/online/updateBasic", { resumeId, basicInfo });

export const updateModule = (resumeId, module) =>
  http.post("/api/resume/online/updateModule", { resumeId, module });

export const updateModuleSort = (resumeId, moduleSort) =>
  http.post("/api/resume/online/updateModuleSort", { resumeId, moduleSort });

export const updateSet = (resumeId, setData) =>
  http.post("/api/resume/online/updateSet", { resumeId, setData });

export const downpdf = (payload) =>
  http.post("/api_file/template/online/downpdf", payload);

export const uploadPhoto = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return http.post("/api/photo/use", fd);
};

// 后端统一返回 {status:'success'|'fail', data}
export function unwrap(res) {
  const body = res && res.data !== undefined ? res.data : res;
  if (body && typeof body === "object" && "data" in body) {
    if (body.status === "success") return body.data;
    if (body.status === "fail") throw new Error(body.data || "请求失败");
  }
  return body;
}
