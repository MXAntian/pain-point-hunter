# Pain Point Hunter 🔍

> 用户评价抓取 + 竞品痛点分析工具 · OpenClaw Skill

---

## 是什么

输入一款游戏的名字，自动抓取 App Store / TapTap 的真实用户评价，提取 TOP10 高频痛点清单，输出结构化竞品分析报告。

## ⚠️ 数据爬取说明

本 skill **不包含完整的数据爬取方案**。

不同部署环境（本地/服务器/沙盒）和不同网络条件（能否访问 App Store/TapTap API）会影响数据来源，agent 需根据实际环境自行选择合适方案：

- **直接调用 API**：iTunes RSS Feed / TapTap REST API（需网络可达）
- **浏览器翻页**：通过 OpenClaw browser 工具抓取页面（适合绕过反爬）
- **自有数据源**：企业内部日志/反馈系统，直接传入评价文本进行分析

skill 本身提供：分析框架 + 关键词词库 + 输出模板，数据来源由调用方自行解决。

## 核心能力

- **双平台抓取**：App Store（iTunes API）+ TapTap（社区 API，无需登录）
- **智能痛点提取**：自动识别高频抱怨词 + 情感聚类
- **策划洞察输出**：从玩家抱怨中提炼设计机会
- **版本追踪**：标注引发集中差评的版本更新

## 使用方式

在 OpenClaw Agent 中直接触发：

```
分析《原神》的玩家痛点
帮我分析一下王者荣耀的差评
卧龙苍天陨落玩家都在吐槽什么
```

---

## 文件结构

```
pain-point-hunter/
├── SKILL.md                      # 主文件，工具说明
├── fetch_reviews.js              # 抓取脚本（Node.js）
└── references/
    └── pain-point-guide.md       # 知识库：词库+分析方法
```

## 触发词

`竞品分析` `玩家痛点` `差评分析` `TapTap评价` `AppStore评价`

---

*Powered by 爱芮 🐰 · Built for game designers*
