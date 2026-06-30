// 內容類型登錄表(驅動後台側邊導覽與各列表頁的共用設定)。
// minRole:可在後台看到/操作此類型的最低角色。
// 學生(投稿者)僅能建 Blog 與 Publications 草稿,故只有這兩類 minRole=STUDENT。

import { Role } from "@/generated/prisma/client";

export interface CmsTypeMeta {
  key: string;
  label: string;
  path: string;
  minRole: Role;
}

export const CMS_TYPES: CmsTypeMeta[] = [
  { key: "dashboard-posts", label: "動態佈告欄", path: "/admin/dashboard-posts", minRole: "ADMIN" },
  { key: "publications", label: "Publications", path: "/admin/publications", minRole: "STUDENT" },
  { key: "team", label: "現役成員", path: "/admin/team", minRole: "ADMIN" },
  { key: "alumni", label: "歷屆成員去向", path: "/admin/alumni", minRole: "ADMIN" },
  { key: "jobs", label: "職缺管理", path: "/admin/jobs", minRole: "ADMIN" },
  { key: "blog", label: "光電小講堂 Blog", path: "/admin/blog", minRole: "STUDENT" },
  { key: "courses", label: "課程紀錄", path: "/admin/courses", minRole: "ADMIN" },
  { key: "industry", label: "產學與專利", path: "/admin/industry", minRole: "ADMIN" },
  { key: "highschool", label: "給高中生的話", path: "/admin/highschool", minRole: "ADMIN" },
];
