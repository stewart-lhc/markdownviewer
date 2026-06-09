# Markdownviewer Share Pro 与 Converter Pro 商业化 Roadmap

> 文档状态：工作稿
> 日期：2026-06-09
> 适用产品：markdownviewer.run
> 关联文档：docs/commercial_optimization_prd.md

## 1. 方向判断

Markdownviewer 的商业化不应从基础 Markdown viewer 收费开始。基础预览、粘贴、本地文件、workspace、少量分享和少量转换应继续作为免费获客入口。

商业化主线应围绕两个高意图任务：

1. Share Pro：把 Markdown 变成可正式发送、可控制、可统计的在线阅读页面。
2. Converter Pro：把 Office、HTML、数据文件、文本型 PDF 等转换为 Markdown，并支持批量、历史、下载和 API 自动化。

第一阶段优先 Share Pro。原因是当前产品已经有 stored share links、share reader、workspace、导出、主题和本地优先信任叙事，工程路径最短，付费理由也更清晰。

Converter Pro 排在第二阶段。原因是转换有明确 SEO 长尾和 API 潜力，但会引入文件安全、队列、失败率、成本、历史存储和质量报告等复杂度，不适合和第一个付费实验同时上线。

## 2. Roadmap 总览

| 阶段 | 名称 | 核心目标 | 上线口径 | 推荐周期 |
|---|---|---|---|---|
| Phase 0 | 商业化信号验证 | 在不接入完整支付的情况下验证用户是否点击 Pro 功能 | Pricing draft、Pro 功能入口、waitlist 或 checkout intent | 1-2 周 |
| Phase 1 | Share Pro MVP | 验证用户是否愿意为正式分享能力付费 | 密码、过期、noindex、custom slug、基础管理、基础用量 | 3-5 周 |
| Phase 2 | Share Pro 收费版 | 接入真实订阅和可持续运营能力 | 登录、订阅、账单、删除/下线、基础统计、举报 | 4-6 周 |
| Phase 3 | Converter Pro Beta | 验证批量转换和历史记录的付费价值 | 批量转换、转换历史、ZIP 下载、用量限制 | 4-6 周 |
| Phase 4 | Converter Pro API | 验证开发者自动化需求 | API key、转换 API、job 查询、webhook、按量计费 | 6-8 周 |
| Phase 5 | Team / Admin 扩展 | 在个人 Pro 和 API 有数据后扩展团队能力 | team billing、共享库、团队额度、运营后台 | 后置 |

## 3. 分阶段 MVP 拆分

### MVP 0：商业化信号验证

目标不是收费，而是确认用户是否有升级意图。

#### Must

- Pricing 页面草案，展示 Free / Pro / API later。
- Workspace share modal 增加 Pro-only 功能入口，但不阻断当前免费 share。
- 对 password、expiration、custom slug、noindex、analytics、batch convert 等动作记录 intent。
- Pro 点击后进入 waitlist、email capture 或 checkout intent 页面。
- 增加最小事件：`pricing_viewed`、`pro_feature_clicked`、`share_paywall_viewed`、`conversion_pro_intent`。

#### Should

- 在 share 成功后展示轻量 upsell：`Make this link private with Pro`。
- 在 convert 成功后展示轻量 upsell：`Batch convert with Pro`。
- 记录入口来源：landing、workspace、share modal、conversion result。

#### Won't

- 不接入完整订阅。
- 不做账户 dashboard。
- 不限制现有免费核心功能。
- 不做 Converter 批量队列。

#### 通过标准

- Pro 功能点击率达到可继续投入的阈值，例如 share 创建用户中 5%-10% 点击 Pro 功能。
- 有明确的 email / checkout intent 留资。
- 免费 share、文件转换、workspace 留存没有明显下降。

### MVP 1：Share Pro MVP

目标是上线第一个可收费的产品包，验证 Share Pro 是否能产生真实付费。

#### Must

- 登录用户可以创建 Pro share。
- Pro share 支持 password、expiration、noindex、custom slug。
- 用户可以查看自己的 share 列表并删除 share。
- Free 用户保留少量公开 share 额度。
- Pro-only 功能触发升级提示。
- Share 页面访问控制正确：密码、过期、删除、slug、noindex。
- 记录核心漏斗事件。

#### Should

- 基础访问统计：总浏览量、最近访问时间、referrer 粗分类。
- 举报入口和最小管理员下线能力。
- Stripe、Paddle 或 Lemon Squeezy 订阅集成，先只支持一个 Pro plan。

#### Won't

- 不做 team workspace。
- 不做自定义域名。
- 不做高级品牌主题。
- 不做公开索引型发布平台。
- 不做评论、协作或版本管理。

#### 通过标准

- 用户可以从 workspace 创建一个受控 share，并完成访问验证。
- 免费用户升级路径完整。
- 删除或过期后公开 URL 不泄露内容。
- 付费转化或 checkout intent 达到继续迭代阈值。

### MVP 2：Share Pro 收费版

目标是把 Share Pro 从可收费实验变成可运营的轻量 SaaS。

#### Must

- 订阅状态、账单 portal、取消订阅、续费状态同步。
- Usage ledger 记录 share 创建、Pro 功能使用、额度周期。
- Dashboard 支持 shares、usage、billing 三个基础区域。
- 支付 webhook 幂等。
- Share 数据支持删除、下线、过期清理。
- Terms、Privacy、Abuse/DMCA 文案上线。

#### Should

- 访问统计按天聚合，避免保存过多明细。
- Pro 用户可以移除或弱化 Markdownviewer branding。
- Share reader 支持一到两个 Pro theme。

#### Won't

- 不做团队权限。
- 不做 SSO。
- 不做自定义域名。
- 不做复杂 analytics。

#### 通过标准

- 真实订阅用户能完成开通、使用、管理、取消。
- 运营可以处理滥用分享链接。
- 关键收入和使用指标可查看。

### MVP 3：Converter Pro Beta

目标是验证用户是否愿意为批量转换、历史和下载付费。

#### Must

- 保留现有单文件转换免费入口。
- Pro 用户可批量上传多个支持格式文件。
- 转换任务有状态：queued、processing、completed、failed。
- 支持转换历史，保留 30 天。
- 支持批量 Markdown ZIP 下载。
- 失败文件可单独重试，失败不扣额度或退回额度。
- 文件大小、任务数量、并发限制明确。

#### Should

- 转换质量报告：输出字符数、图片丢失、表格风险、PDF 文本层提示。
- 用量按文件数或处理单位计费。
- 转换结果一键打开到 workspace tab。

#### Won't

- 不做 OCR PDF。
- 不做图片版 PDF 高保真还原。
- 不做跨格式排版还原承诺。
- 不做 API。

#### 通过标准

- 批量转换成功率和失败原因可统计。
- Pro 用户实际使用批量转换或历史下载。
- 单位成本在 Pro 价格内可控。

### MVP 4：Converter Pro API

目标是验证开发者和自动化场景。

#### Must

- API key 创建、撤销、命名。
- `POST /v1/conversions` 上传或 URL 提交任务。
- `GET /v1/conversions/{job_id}` 查询状态。
- `GET /v1/conversions/{job_id}/download` 下载 Markdown。
- API rate limit、quota、错误码。
- 基础 API docs 和示例。

#### Should

- Webhook。
- Batch API。
- Usage dashboard。
- 失败原因和质量报告进入 API 响应。

#### Won't

- 不做 OCR。
- 不做私有部署。
- 不做企业合同能力。

#### 通过标准

- 至少一个真实自动化场景能稳定跑通。
- API 成本、错误率、超时率可监控。
- API plan 有明确付费或强 intent。

## 4. 推荐执行顺序

1. 先上线 MVP 0，收集 Share Pro 和 Converter Pro 的意图数据。
2. 若 Share Pro intent 明显高于 Converter intent，进入 MVP 1。
3. 若 Converter intent 更高，但集中在单文件场景，先优化现有转换 SEO 和结果体验，不急于做 Pro。
4. Share Pro MVP 收费验证成立后，再进入 MVP 2。
5. Converter Pro Beta 必须在以下条件满足后开始：
   - 已有足够 conversion 使用数据；
   - 能统计失败率和文件类型分布；
   - 能估算单位转换成本；
   - Share Pro 没有占用全部商业化工程资源。

## 5. 套餐演进建议

| 阶段 | Free | Pro | API |
|---|---|---|---|
| MVP 0 | 当前免费能力 | Waitlist / intent | Waitlist |
| MVP 1 | 少量公开 share、单文件转换 | Share Pro，$6-8/月 | 不上线 |
| MVP 2 | 低额度 share、单文件转换 | Share Pro，$8/月或 $80/年 | 不上线 |
| MVP 3 | 单文件转换低额度 | Share Pro + Converter Pro，$10-12/月 | Waitlist |
| MVP 4 | 基础 viewer 和低额度转换 | 个人 Pro | API Starter，$19/月起 |

## 6. 关键指标

### Share Pro

- share modal open rate；
- share created rate；
- Pro feature click rate；
- password / expiration / slug / noindex intent split；
- paywall to checkout rate；
- checkout to paid rate；
- share viewed rate；
- deleted / expired / reported share rate。

### Converter Pro

- conversion started rate；
- conversion completed rate；
- conversion failed rate by file type；
- average file size；
- repeat conversion user rate；
- batch convert intent；
- ZIP download intent；
- API waitlist intent；
- unit conversion cost。

## 7. 主要风险

| 风险 | 影响 | 应对 |
|---|---|---|
| Share Pro 付费意愿不足 | 第一个收费包无法成立 | MVP 0 先验证 intent，MVP 1 限定工程范围 |
| 免费 share 被滥用 | SEO、品牌和法务风险 | 免费额度、默认 noindex、举报、后台下线 |
| Converter 成本不可控 | 毛利不稳定 | Converter Pro 后置，先拿文件类型和失败率数据 |
| 转换质量不稳定 | 退款和投诉 | 明确格式边界，失败不扣额度，先不做 OCR |
| 账户/支付过早拖慢产品验证 | 周期变长 | MVP 0 用 intent，MVP 1 只接一个 Pro plan |
| Team 需求过早进入 | 产品复杂化 | Team 后置到个人 Pro 和 API 有数据后 |

## 8. 当前不做的方向

- 不把 Markdownviewer 改造成 GitBook / ReadMe 替代品。
- 不做多人实时协作。
- 不做完整知识库、评论、审批流。
- 不做 OCR 和高保真文档还原。
- 不承诺 share 页面成为长期公开 SEO 内容网络。
- 不在第一个 MVP 做自定义域名或企业权限。
