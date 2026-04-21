# Prompts 文档索引

本目录包含多个专业领域的提示词文档集合，用于指导 AI 完成特定的开发任务。

## 文档集合列表

### 1. Prompts Frontend Libs

**版本**: 1.0.1

**功能**: 前端组件库开发辅助提示词集合，提供 React 组件库开发全流程的指导文档

**适用场景**:
- React 组件库开发与维护
- 项目文档自动化生成
- TypeScript 类型定义完善
- 组件国际化支持
- 组件示例代码编写

**核心内容**:
- 组件国际化处理方案
- TypeScript 类型声明添加
- package.json 信息完善
- 包功能描述文件生成
- 项目文档自动生成
- 组件示例代码编写规范

**包含文档**:
- [国际化](./prompts-frontend-libs/国际化.md) - 组件多语言支持指南
- [添加ts类型声明](./prompts-frontend-libs/添加ts类型声明.md) - TypeScript 类型定义指南
- [完善package.json描述和关键词](./prompts-frontend-libs/完善package.json描述和关键词.md) - 包信息优化指南
- [生成包功能描述文件](./prompts-frontend-libs/生成包功能描述文件.md) - API 描述文件生成
- [生成文档](./prompts-frontend-libs/生成文档.md) - 项目文档生成指南
- [组件示例编写](./prompts-frontend-libs/组件示例编写.md) - 示例代码编写规范

**详细索引**: 查看 [Prompts Frontend Libs 详细索引](./prompts-frontend-libs/README.md)

---

## 快速选择指南

根据您的需求快速定位到合适的文档：

| 需求 | 推荐文档 | 所属集合 |
|------|----------|----------|
| 组件需要支持多语言 | [国际化](./prompts-frontend-libs/国际化.md) | Prompts Frontend Libs |
| 为 JS 组件库添加 TS 类型支持 | [添加ts类型声明](./prompts-frontend-libs/添加ts类型声明.md) | Prompts Frontend Libs |
| 完善 package.json 描述和关键词 | [完善package.json描述和关键词](./prompts-frontend-libs/完善package.json描述和关键词.md) | Prompts Frontend Libs |
| 生成包的 API 描述文件 | [生成包功能描述文件](./prompts-frontend-libs/生成包功能描述文件.md) | Prompts Frontend Libs |
| 生成项目概述和 API 文档 | [生成文档](./prompts-frontend-libs/生成文档.md) | Prompts Frontend Libs |
| 编写组件演示示例代码 | [组件示例编写](./prompts-frontend-libs/组件示例编写.md) | Prompts Frontend Libs |

---

## 文档说明

### 如何使用

1. **浏览索引**：根据上方表格或文档集合列表，找到符合您需求的文档
2. **查看详情**：点击文档链接查看详细的提示词内容
3. **应用提示词**：将文档内容作为指令提供给 AI，指导其完成相应任务

### 版本信息

各文档集合的版本信息记录在 `prompts.json` 文件中，便于追踪和更新管理。

### 贡献指南

如需添加新的提示词文档集合，请：
1. 在本目录下创建子目录
2. 编写 README.md 说明文档集合的用途和内容
3. 在 `prompts.json` 中添加版本信息
4. 更新本索引文档
