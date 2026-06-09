# PRD｜Markdownviewer Share Pro MVP

> 文档状态：工作稿
> 日期：2026-06-09
> 适用产品：markdownviewer.run
> Roadmap 阶段：MVP 1
> 关联文档：docs/superpowers/specs/2026-06-09-commercialization-roadmap.md

## 1. 一句话结论

Share Pro MVP 的目标是验证用户是否愿意为“正式分享 Markdown”付费，而不是建设完整商业化平台。

首版只做 Markdown 分享场景中最明确的付费点：密码访问、过期时间、noindex、自定义 slug、我的分享列表、删除分享和基础用量限制。

## 2. 背景

Markdownviewer 已经具备免费 workspace、stored share links、share reader、文档转换、本地文件夹、PWA 和导出能力。当前免费分享可以证明“把 Markdown 变成链接”的基础价值，但还不足以支撑付费。

用户愿意付费的场景更可能发生在这些时刻：

- AI 生成的 Markdown 报告需要发给客户、同事或投资人；
- README、技术方案、需求文档需要临时给别人阅读；
- 用户不想把内容放进 Notion、GitHub、Google Docs 或完整文档站；
- 用户需要控制访问、过期、索引和链接外观。

因此，Share Pro MVP 的产品定位是：

> 把 Markdown 快速变成适合正式发送的受控阅读链接。

## 3. 目标

### 3.1 产品目标

- 保留当前免费、低摩擦的 Markdown viewer 和 workspace。
- 让用户在创建分享链接时看到清晰的 Pro 价值。
- 支持最小可收费 Share Pro 能力。
- 让用户可以管理和删除自己创建的 share。
- 建立 share 付费漏斗数据。

### 3.2 业务目标

- 验证 Share Pro 的 checkout intent 或真实付费。
- 判断 password、expiration、noindex、custom slug 中哪个最有付费吸引力。
- 控制免费分享滥用风险。
- 为后续 Converter Pro 保留工程资源和数据判断空间。

## 4. 非目标

本 MVP 不做：

- Converter Pro 批量转换；
- API；
- OCR；
- Team workspace；
- 自定义域名；
- 多人协作、评论、版本历史；
- 高级品牌主题系统；
- SSO、RBAC、审计日志；
- 替代 GitBook / ReadMe 的正式文档站。

## 5. 用户与场景

### Persona A：AI power user / PM / 咨询顾问

任务：把 AI 生成的 Markdown 报告发给客户或同事。

付费触发：希望链接有密码、会过期、看起来更正式、不被搜索引擎索引。

### Persona B：独立开发者 / 开源维护者

任务：临时分享 README、CHANGELOG、Release Notes 或技术方案。

付费触发：希望链接短、可读、可撤回，有 GitHub 风格渲染和 Mermaid/KaTeX 支持。

### Persona C：技术写作者 / 小团队 owner

任务：把轻量文档临时发布给内部或外部读者。

付费触发：希望管理历史链接、删除过期内容、查看基础访问数据。

## 6. MVP 范围

### Must

- 登录或身份机制支持用户拥有自己的 share。
- 免费用户可以继续创建少量公开 share。
- Pro 用户可以创建带密码的 share。
- Pro 用户可以设置 share 过期时间。
- Pro 用户可以设置 noindex。
- Pro 用户可以设置 custom slug。
- 用户可以查看自己的 share 列表。
- 用户可以删除自己的 share。
- Share 页面正确处理 password、expired、deleted、not found、noindex。
- Workspace share modal 展示 Pro 功能和升级入口。
- 核心事件埋点。

### Should

- 基础访问统计：总浏览次数、最近访问时间。
- 举报入口。
- 管理员下线 share 的最小能力。
- Pro plan 支持月付和年付。

### Could

- 移除 Markdownviewer branding。
- 一到两个 Pro reader theme。
- share 成功后展示 upgrade suggestion。

### Won't

- Team 管理。
- 自定义域名。
- 完整 analytics。
- 评论和协作。
- API 创建 share。

## 7. 用户流程

### 7.1 Free 用户创建公开 share

1. 用户进入 workspace。
2. 用户粘贴、打开或转换 Markdown。
3. 用户点击 Share。
4. Share modal 默认展示免费公开分享选项。
5. 用户点击 Create public share。
6. 系统创建 share，消耗免费额度。
7. 用户复制链接。
8. share 成功状态展示 Pro 入口：`Add password or expiration with Pro`。

### 7.2 Free 用户点击 Pro 功能

1. 用户打开 Share modal。
2. 用户开启 Password、Expiration、Noindex 或 Custom slug。
3. 系统展示 Pro paywall，不立即丢失用户输入。
4. 用户点击 Upgrade。
5. 系统进入 checkout、waitlist 或 pricing 页面。
6. 事件记录 requested_feature。

### 7.3 Pro 用户创建受控 share

1. Pro 用户打开 Share modal。
2. 用户填写标题、slug、密码、过期时间、noindex。
3. 用户点击 Create Pro share。
4. 系统校验 slug、密码强度、过期时间。
5. 创建成功后返回 share URL。
6. 访问该 URL 时按配置进行访问控制。

### 7.4 用户删除 share

1. 用户进入 Dashboard / My Shares。
2. 用户找到目标 share。
3. 用户点击 Delete。
4. 系统要求确认。
5. 删除后，公开 URL 不再显示原内容。

## 8. 功能需求

### FR-SHARE-MVP-001：Share modal Pro 配置

Share modal 必须支持以下配置：

| 字段 | Free | Pro | 说明 |
|---|---|---|---|
| title | 支持 | 支持 | 默认从 Markdown H1 或文件名生成 |
| visibility | public | public / private-ish | MVP 不做团队私有权限，private-ish 指不可索引和可密码保护 |
| password | paywall | 支持 | 密码 hash 存储 |
| expires_at | paywall | 支持 | 过期后不显示内容 |
| noindex | paywall | 支持 | 输出 robots meta |
| custom_slug | paywall | 支持 | slug 唯一且可读 |

验收：

- Free 用户点击 Pro 字段时看到升级提示。
- Pro 用户可以保存这些配置。
- 已输入内容在 paywall 跳转前不被清空。

### FR-SHARE-MVP-002：Share 创建与额度

规则：

- Free 用户每月允许创建少量公开 share，建议初始为 5 个。
- Pro 用户每月允许创建较高额度 share，建议初始为 100 个。
- 超额时展示 quota message 和升级入口。
- 创建失败不扣额度。

验收：

- quota 递减或 ledger 记录准确。
- 超额用户不能继续创建免费 share。
- Pro 用户不受 Free 额度限制。

### FR-SHARE-MVP-003：密码访问

规则：

- 密码只允许 Pro share。
- 密码必须 hash 存储，不保存明文。
- 访问密码 share 时，未验证前不返回 Markdown 内容。
- 密码错误展示通用错误，不泄露内容。

验收：

- 未输入密码不能看到内容。
- 错误密码不能看到内容。
- 正确密码后可以看到 reader 页面。

### FR-SHARE-MVP-004：过期时间

规则：

- Pro 用户可设置过期时间。
- 支持预设：24 hours、7 days、30 days、custom date。
- 到期后 share 页面显示 expired 状态。
- 到期后不返回 Markdown 内容。

验收：

- 未过期链接正常访问。
- 过期链接不显示内容。
- owner 在 My Shares 中能看到 expired 状态。

### FR-SHARE-MVP-005：Noindex

规则：

- Pro 用户可设置 noindex。
- noindex share 页面输出 `robots` meta。
- 免费公开 share 的默认索引策略需要产品确认；建议 MVP 默认 noindex，避免滥用和低质量公开页风险。

验收：

- noindex share 的 HTML 包含 robots noindex。
- 非 noindex share 不错误输出 noindex，除非产品选择免费 share 全部默认 noindex。

### FR-SHARE-MVP-006：Custom slug

规则：

- Pro 用户可设置 custom slug。
- slug 只允许小写字母、数字、短横线。
- slug 长度建议 4-60。
- 系统必须校验唯一性。
- 保留字不可用，例如 `api`、`workspace`、`pricing`、`share`、`admin`。

验收：

- 合法 slug 创建成功。
- 重复 slug 返回 `SLUG_TAKEN`。
- 非法 slug 返回明确错误。

### FR-SHARE-MVP-007：My Shares

用户需要一个最小管理页，可以查看和删除自己的 shares。

列表字段：

- title；
- URL 或 slug；
- created_at；
- expires_at；
- status；
- has_password；
- noindex；
- view_count；
- delete action。

验收：

- 用户只能看到自己的 shares。
- 删除后列表状态更新。
- 删除后的 share URL 不泄露内容。

### FR-SHARE-MVP-008：基础访问统计

MVP 只做基础统计，不做完整 analytics。

记录：

- share_id；
- viewed_at；
- referrer coarse category；
- user agent coarse device；
- country 可后置，除非已有稳定 analytics 来源。

展示：

- total views；
- last viewed at；
- optional daily views 最近 7 天。

验收：

- 每次成功访问 reader 内容时 view_count 增加。
- 密码错误、过期、删除不计入成功阅读。

### FR-SHARE-MVP-009：删除与管理员下线

规则：

- owner 可以删除自己的 share。
- 管理员可以 suspend share。
- deleted 和 suspended 都不能返回 Markdown 内容。
- 页面展示状态不同：deleted、suspended。

验收：

- 删除后不可访问原内容。
- suspended 后不可访问原内容。
- 管理员操作有基础日志。

## 9. 数据模型建议

### ShareDocument

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 内部 ID |
| owner_id | string | 用户 ID |
| slug | string | 可为空，Pro custom slug |
| title | string | 标题 |
| markdown | text/blob | Markdown 内容 |
| status | enum | active / expired / deleted / suspended |
| has_password | boolean | 是否需要密码 |
| password_hash | string | 可为空 |
| expires_at | datetime | 可为空 |
| noindex | boolean | 是否 noindex |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |
| deleted_at | datetime | 删除时间 |

### ShareViewEvent

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 事件 ID |
| share_id | string | share ID |
| viewed_at | datetime | 访问时间 |
| referrer_category | string | direct / search / social / app / other |
| device_category | string | desktop / mobile / tablet / bot / unknown |

### UsageLedger

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 记录 ID |
| user_id | string | 用户 ID |
| event_type | enum | share_created / pro_share_created |
| units | number | 消耗额度 |
| period | string | 计费周期 |
| source_id | string | share ID |
| created_at | datetime | 创建时间 |

## 10. API 建议

```http
POST /api/shares
GET /api/shares
GET /api/shares/{id}
PATCH /api/shares/{id}
DELETE /api/shares/{id}
POST /api/shares/{id}/password
GET /api/shares/{id}/analytics
```

MVP 可以保留现有 `/api/share` 兼容入口，但新功能建议迁移到复数 `/api/shares`，避免后续管理、权限和分析接口命名混乱。

## 11. 埋点

| 事件 | 触发时机 | 关键属性 |
|---|---|---|
| `share_modal_opened` | 打开 share modal | source_page, plan |
| `share_created` | 创建成功 | plan, has_password, has_expiration, noindex, has_custom_slug |
| `share_create_failed` | 创建失败 | error_code, plan |
| `pro_feature_clicked` | 点击 Pro 字段 | feature, source_page |
| `share_paywall_viewed` | 展示升级提示 | requested_feature |
| `checkout_started` | 开始支付 | plan, requested_feature |
| `share_viewed` | 成功阅读 share | share_id, status, device_category |
| `share_deleted` | owner 删除 | share_age_days |
| `share_suspended` | admin 下线 | reason_category |

## 12. 隐私与安全

- 本地文件和粘贴 Markdown 默认留在浏览器。
- 创建 share 会把 Markdown 存储到服务端。
- 创建 password share 前必须明确说明访问者需要密码。
- password share 未验证前不得把 Markdown 内容送到客户端。
- 删除、过期、下线状态不得泄露 Markdown 内容、标题以外敏感摘要或正文片段。
- Markdown 渲染继续使用现有 sanitize 策略，禁止危险 HTML 和脚本。
- 外链默认 `rel="noopener noreferrer"`。
- 免费 share 必须有速率限制和额度限制。

## 13. 文案

### Pro value prop

英文：

> Make your Markdown ready to send. Add a password, expiration, noindex, custom slug, and basic reader stats.

中文：

> 让 Markdown 更适合正式发送：支持密码、过期、noindex、自定义 slug 和基础阅读统计。

### Paywall

英文：

> This is a Share Pro feature. Keep your Markdown link private, controlled, and easy to revoke.

中文：

> 这是 Share Pro 功能。让你的 Markdown 链接更私密、可控，并且随时可以撤回。

### Expired page

英文：

> This shared Markdown link has expired.

中文：

> 这个 Markdown 分享链接已过期。

## 14. 验收标准

- Free 用户仍能创建公开 share。
- Free 用户点击 password、expiration、noindex、custom slug 时看到升级提示。
- Pro 用户可以创建 password share。
- Pro 用户可以创建 expiration share。
- Pro 用户可以创建 noindex share。
- Pro 用户可以创建 custom slug share。
- 密码错误、过期、删除、下线均不泄露 Markdown 内容。
- owner 可以在 My Shares 删除 share。
- share 创建、paywall、访问、删除事件可被记录。
- 现有 workspace、导出、转换、普通 share 不回归。

## 15. 发布计划

### Milestone 1：规格与数据基础

- 确认 Pro 字段和 paywall 文案。
- 定义 share 数据模型。
- 定义事件和 dashboard 最小需求。
- 确认支付服务选择或先使用 waitlist/checkout intent。

### Milestone 2：Share Pro 核心能力

- Share modal 增加 Pro 配置。
- Share 创建 API 支持 password、expiration、noindex、slug。
- Share reader 支持访问控制。
- My Shares 支持列表和删除。

### Milestone 3：商业化闭环

- 接入 Pro 升级路径。
- 加入 quota。
- 加入基础访问统计。
- 加入举报或管理员下线。

### Milestone 4：验证与发布

- 单元测试和路由测试。
- 手动验证免费 share、Pro share、过期、删除、密码。
- 上线 pricing / Pro 文案。
- 观察第一周指标。

## 16. 开放问题

1. 首版是否接真实支付，还是先用 waitlist/checkout intent？
2. Free share 是否默认 noindex？
3. Pro 价格先定 $6、$8 还是 $10？
4. 登录使用哪种方案？
5. share 内容继续使用现有 blob/store，还是迁移到数据库？
6. 访问统计是否需要过滤 bot？
7. 中国大陆用户是否进入首版支付范围？
8. 开源版和云端 Pro 的边界如何写进 README 和 pricing？
