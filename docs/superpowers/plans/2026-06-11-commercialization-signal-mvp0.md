# Markdownviewer 商业化信号验证 MVP 0 实施计划

> 日期：2026-06-11
> 状态：执行中
> 关联文档：
> - `docs/commercial_optimization_prd.md`
> - `docs/superpowers/specs/2026-06-09-commercialization-roadmap.md`
> - `docs/superpowers/specs/2026-06-09-share-pro-mvp-prd.md`

## 1. 决策

本阶段不接入支付、不做登录、不限制现有免费功能。先上线一个可观测的商业化信号层，验证用户是否会对 Share Pro 能力产生明确 intent。

第一版聚焦 Share Pro intent，而不是完整 Share Pro：

- Pricing 页面说明 Free / Share Pro / Converter API later。
- Workspace 分享成功后展示 Pro 探针。
- Pro 探针包含 password、expiration、noindex、custom slug。
- 点击 Pro 探针进入 Pricing，并带上 `intent` / `source` 参数。
- 记录轻量前端事件，便于 GA 可用时进入 `dataLayer`。

## 2. 非目标

- 不接 Stripe、Paddle、Lemon Squeezy。
- 不做账号系统或 dashboard。
- 不改变 `/api/share` 的公开分享行为。
- 不做密码保护、过期、noindex、custom slug 的真实访问控制。
- 不做 Converter Pro 批量队列或 API。

## 3. 文件计划

新增：

- `app/pricing/page.tsx`
- `app/zh-CN/pricing/page.tsx`
- `components/pricing/pricing-page-content.tsx`
- `lib/analytics/product-events.ts`
- `tests/pricing/pricing-page.test.tsx`

修改：

- `components/workspace/workspace-shell.tsx`
- `components/landing/topbar.tsx`
- `lib/i18n/messages.ts`
- `app/globals.css`
- `app/sitemap.ts`
- `tests/landing/homepage.test.tsx`
- `tests/workspace/workspace-shell.test.tsx`

## 4. 验收标准

- `/pricing` 和 `/zh-CN/pricing` 可以渲染，包含 Free、Share Pro、Converter API later。
- 首页 topbar 出现 Pricing / 定价入口，链接本地化正确。
- 分享成功弹窗保留原有 copy/open link 行为，并展示 4 个 Pro intent 动作。
- 点击 Pro intent 会跳转到本地化 Pricing URL，保留 `source=share_success` 和 `intent=<feature>`。
- 点击 Pro intent 时调用 `trackProductEvent("pro_feature_clicked", ...)`。
- sitemap 包含 `/pricing` 与 `/zh-CN/pricing`。
- 聚焦测试通过。

## 5. 执行状态

- [x] 计划文档
- [x] Pricing 页面
- [x] Topbar 和 sitemap
- [x] Share Pro intent 探针
- [x] 测试
- [x] 验证
