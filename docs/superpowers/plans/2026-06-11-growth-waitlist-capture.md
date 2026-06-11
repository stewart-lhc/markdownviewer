# Markdownviewer 增长阶段 Waitlist 邮箱收集实施计划

> 日期：2026-06-11
> 状态：执行中
> 关联：`docs/growth_retention_mvp_prd.md`

## 1. 背景修正

当前用户量还少，不继续推进商业化。上一版 `/pricing` 只作为足够的试探保留，但 CTA 不能再跳到 workspace。点击 `Join Share Pro waitlist` 必须收集邮箱，并在 Resend 配置存在时给用户发确认邮件。

## 2. 本次范围

- `/pricing` 页面降调为早期访问 waitlist 页面。
- Share Pro / Converter API CTA 改为邮箱表单。
- 新增 `/api/waitlist`。
- 新增 waitlist 存储层：
  - 优先使用 Cloudflare D1 HTTP API。
  - D1 未配置时，开发环境写入 `.data/waitlist/subscribers.jsonl`。
- 新增 Resend 确认邮件：
  - `RESEND_API_KEY` 存在时发送。
  - `RESEND_FROM` 可配置，默认使用 Resend 测试发件人。
- 增加 API 和页面测试。

## 3. 非目标

- 不接支付。
- 不做用户账号。
- 不做 dashboard。
- 不把 Cloudflare admin token 或 Resend key 写进源码。
- 不继续扩展商业化功能。

## 4. 验收

- 点击 Share Pro waitlist 不再跳 workspace。
- 输入邮箱后调用 `/api/waitlist`。
- 本地无 D1 配置时写入 `.data/waitlist/subscribers.jsonl`。
- 有 Resend 配置时给用户发确认邮件。
- 页面和 API 测试通过。
- `npm run build` 通过。

## 5. 执行状态

- [x] 页面表单
- [x] API 和存储
- [x] Resend 邮件
- [x] 测试
- [x] 验证
