# Markdownviewer MarkItDown 文件转换 MVP 设计

## 背景

Markdownviewer 当前已经是一个成熟的在线 Markdown viewer 和 workspace：支持粘贴、本地 Markdown 文件、本地文件夹、GitHub/Gist/raw URL、PWA 文件打开、多标签、编辑、预览、分享和导出。

新的产品机会是接入 Microsoft MarkItDown，把常见非 Markdown 文件转换成 Markdown，再进入现有 workspace。这个方向不应把 Markdownviewer 改造成通用文件转换 SaaS，而应加强现有定位：

> 用户上传 Office、HTML、CSV、JSON、XML 或 text-heavy PDF 后，直接得到可编辑、可预览、可分享、可导出的 Markdown 文档。

调研结论：

- MarkItDown 明确面向 LLM 和文本分析管线，输出结构化 Markdown，适合保留 headings、lists、tables、links 等重要内容，但不承诺高保真排版。
- TO MD、MD Convert、Aspose、Datalab/Marker、Docling、MinerU、LlamaParse 等产品和开源项目已经证明文件转 Markdown 有真实需求。
- 现有竞品多停在“转换后下载”，Markdownviewer 的差异化应是“转换后进入 workspace 继续阅读、清理、编辑、分享和导出”。

## 目标

1. 在 `/workspace` 增加本地文件上传转换入口，支持用户把非 Markdown 文件转换成 Markdown。
2. 转换成功后，自动把结果打开为新的 workspace tab，继续使用现有预览、编辑、outline、主题、分享、HTML/PDF 导出能力；用户不需要先下载 `.md` 再手动重新导入。
3. 第一版只处理本地上传文件，不处理远程 URL、账号、历史记录或批量队列。
4. 对 text-heavy PDF 提供支持，但文案明确不承诺扫描件、复杂 OCR、复杂表格或高保真版式恢复。
5. 服务端只在单次请求内临时处理文件，不持久化原文件或转换结果；转换后的 Markdown 只返回给浏览器。
6. 保持现有 Markdown 文件导入、PWA `.md` 文件打开、本地文件夹 workspace 和远程 Markdown import 行为不变。

## 非目标

- 不做万能文件转换平台。
- 不支持远程 PDF/DOCX/PPTX URL 转换。
- 不支持图片 OCR、音频转写、YouTube、视频、Azure Content Understanding 或 LLM 增强转换。
- 不做批量转换、转换历史、账号、团队、计费。
- 不保存用户上传文件、转换结果或转换日志中的文件内容。
- 不承诺复杂 PDF、高保真排版、扫描件识别、复杂表格恢复、图片路径保留或 code block 自动完美识别。
- 不改变现有 Markdown renderer 语义，不替换 `react-markdown` 预览栈。

## 推荐方案

采用“服务端临时转换 API”：

1. 前端上传一个支持的非 Markdown 文件。
2. Next.js API route 接收 `multipart/form-data`。
3. API 验证扩展名、MIME、大小和请求形态。
4. API 把文件写入临时目录，调用 MarkItDown CLI 或一个薄 Python wrapper。
5. 转换结果作为 Markdown 文本返回给前端，服务端不保存 `.md` 文件。
6. 前端立即创建并激活一个新的 workspace tab，`sourceInput` 标记为 `converted:<filename>`，`sourceKind` 标记为转换导入。
7. 临时文件在请求结束后删除。

这个方案最适合 MVP：它复用现有 workspace 体验，工程边界清楚，用户价值可直接验证。独立微服务、OCR/LLM 增强和 URL 转换都留到后续验证需求后再评估。

## 支持格式

### MVP Must

- `.docx`
- `.pptx`
- `.xlsx`
- `.xls`
- `.csv`
- `.html`
- `.htm`
- `.json`
- `.xml`

### MVP Should

- `.pdf`，仅定位为 text-heavy PDF。

PDF 进入 MVP，但使用保守文案：

- 推荐用于文字型 PDF、报告、规范、说明文档。
- 不保证扫描件、复杂多栏版式、复杂表格、图片型 PDF 或表单能得到理想 Markdown。
- 转换失败或结果质量不足时，用户仍可手动编辑返回的 Markdown。

### 暂不支持

- `.png`, `.jpg`, `.jpeg`, `.webp`, `.tiff`
- `.mp3`, `.wav`, `.m4a`, `.mp4`
- `.zip`
- `.msg`
- YouTube URL
- 任意远程 URL 转换

## 用户体验

### 入口

在 workspace import 入口中增加“Convert file”能力。桌面完整 toolbar 可以显示为独立按钮，也可以在 import menu 中作为一个菜单项；移动端放入现有 import menu，避免挤压 header。

现有 “File” 入口继续用于 `.md/.markdown/.mdx/.txt` 直读。新入口用于非 Markdown 文件转换。

### 文件选择

转换入口的 `accept` 包含 MVP 格式：

```text
.docx,.pptx,.xlsx,.xls,.csv,.html,.htm,.json,.xml,.pdf
```

用户选择 Markdown 文件时仍走原有 file import，不强制转换。

### 转换状态

转换期间显示非阻塞状态：

- `Converting <filename> to Markdown...`
- 成功：`Converted <filename> to Markdown.`
- 失败：显示 API 返回的明确错误，例如文件过大、格式不支持、转换超时、转换结果为空。

### 转换结果

转换成功后自动创建并打开新 tab：

- `markdown`: MarkItDown 输出文本。
- `sourceInput`: `converted:<original filename>`。
- `sourceKind`: `converted-file`。
- tab 标题优先取第一个 heading，其次取原文件名。
- 用户可继续编辑、分享、导出 HTML/PDF。

转换 tab 不绑定原文件，也不支持保存回原 DOCX/PPTX/XLSX/PDF。保存能力仍只对 folder workspace 的 Markdown 文件生效。

### 本地恢复

转换后的 Markdown tab 进入现有 workspace tab persistence。用户关闭 PWA 或浏览器后再次打开 workspace 时，应像其他普通 workspace tab 一样 best-effort 恢复该 tab。

恢复来源是浏览器本地状态，不是服务器保存的文件：

- 清理浏览器数据、换设备、换浏览器或 localStorage/IndexedDB 不可用时，转换 tab 可能无法恢复。
- 如果转换结果超过现有 workspace 持久化容量，应优先保留当前会话体验，并提示用户导出或复制 Markdown。
- 该 tab 不是一个真实磁盘 `.md` 文件，除非用户后续通过导出、复制，或在 local folder workspace 中新建并保存为 Markdown 文件。

## 架构

### 前端

`components/workspace/workspace-toolbar.tsx`：

- 新增转换入口。
- 增加转换文件 input。
- 保持现有 Markdown file input 不变。
- 桌面和 compact/mobile 两套 import UI 都能触发转换。

`components/workspace/workspace-shell.tsx`：

- 新增 `handleConvertFile(file: File)`。
- 新增 `openConvertedFileInNewTab(file: File)` 或等价 helper。
- 对转换结果调用现有 tab 创建和激活流程。
- 保持 `openFileInNewTab(file)` 只处理 Markdown-like 文件。
- 拖拽行为第一版保持现状：只自动打开 Markdown-like 文件，不把任意 PDF/DOCX 拖拽直接送去转换。后续若需求明确，再加拖拽转换提示。

`lib/workspace/convert-document.ts`：

- 定义支持格式、大小限制、错误解析和客户端 API helper。
- 提供 `isConvertibleDocumentFile(file)`、`convertDocumentToMarkdown(file, fetcher)`。

### API

`app/api/convert/route.ts`：

- `runtime = "nodejs"`。
- 只接受 `POST multipart/form-data`。
- 字段名：`file`。
- 校验文件存在、文件名、扩展名、MIME 和大小。
- 写入 OS temp directory 下的 request-scoped 子目录。
- 调用 MarkItDown。
- 返回：

```json
{
  "markdown": "...",
  "label": "Converted document",
  "sourceName": "report.pdf"
}
```

失败返回：

```json
{
  "error": "This file type is not supported for Markdown conversion."
}
```

### MarkItDown 执行层

优先实现一个小型 Node wrapper：

- 用 `child_process` 调用官方 CLI：`markitdown <temp-file>`。
- 设置超时，例如 45 秒。
- 限制 stdout 字符数，例如 2,000,000 characters，沿用现有 Markdown import 的上限。
- 捕获 stderr 但不把长错误完整暴露给用户。
- 请求结束后删除 temp directory。

如果部署环境里 CLI 路径不稳定，再切到 Python wrapper 脚本：

```text
scripts/markitdown-convert.py
```

该脚本只接收本地临时文件路径，输出 Markdown 到 stdout。

## 安全与隐私

1. 不接受 URL，不让 MarkItDown 访问用户传入的远程资源。
2. 只调用本地临时文件转换，避免 SSRF。
3. 使用扩展名 allowlist，不支持任意文件。
4. 限制上传大小，建议 MVP 为 20MB。
5. 限制转换时间，建议 MVP 为 45 秒。
6. 限制输出大小，建议 2,000,000 characters。
7. 每次请求使用独立 temp directory。
8. `finally` 中删除 temp directory。
9. 错误日志不得包含转换后的文档正文。
10. 产品文案明确“文件仅用于本次转换，不保存”，前提是实现确实不持久化。

MarkItDown 官方提醒它会以当前进程权限执行 I/O，因此服务端必须只传入经过校验的本地临时文件路径，并避免启用插件、URL 转换、Azure/LLM/OCR 能力。

## 数据流

1. 用户点击 Convert file。
2. 用户选择一个支持的非 Markdown 文件。
3. 前端检查扩展名和大小，给出快速失败。
4. 前端提交 `FormData` 到 `/api/convert`。
5. API 进行服务端校验。
6. API 写临时文件并调用 MarkItDown。
7. API 返回 Markdown，并删除服务端临时文件和临时目录。
8. 前端自动创建并激活 converted tab，不要求用户下载或重新导入 `.md`。
9. Converted tab 被纳入浏览器本地 workspace tab persistence。
10. 用户在 workspace 中预览、编辑、分享或导出。

## 错误处理

前端需要处理：

- 未选择文件。
- 不支持的扩展名。
- 文件超过大小限制。
- API 连接失败。
- API 返回 4xx/5xx。
- 转换结果为空。

API 需要区分：

- `400`: 请求格式错误、缺少文件、格式不支持、文件过大。
- `413`: 上传过大。
- `422`: MarkItDown 输出为空或无法得到 Markdown。
- `504`: 转换超时。
- `500`: 运行环境缺少 MarkItDown 或内部异常。

用户文案保持简洁，不暴露内部路径：

- `This file type is not supported yet.`
- `This file is too large to convert.`
- `Conversion timed out. Try a smaller or simpler file.`
- `MarkItDown is not available in this deployment.`
- `The converted Markdown was empty.`

## 部署与环境

MVP 需要在部署环境安装 Python 和 MarkItDown。

建议新增文档说明：

```bash
python --version
pip install "markitdown[pdf,docx,pptx,xlsx,xls]"
```

如果 Vercel Node runtime 无法稳定携带 Python/MarkItDown，则实现应暂停在本地验证阶段，转而评估：

1. 独立转换微服务。
2. Docker/自托管部署。
3. Datalab/LlamaParse 等第三方 API。

在没有确认生产环境可运行 MarkItDown 前，不把该功能标记为 production-ready。

## 测试策略

### Unit tests

- `isConvertibleDocumentFile` 支持 allowlist。
- Markdown-like 文件不进入转换路径。
- 文件大小限制生效。
- API helper 能解析成功和错误响应。

### API tests

用 mock conversion runner 覆盖：

- 成功转换。
- 不支持格式。
- 文件过大。
- 转换 stdout 为空。
- 转换超时。
- runner 不可用。
- temp directory cleanup 被调用。

### Workspace tests

- 点击 Convert file 后调用转换 helper。
- 转换成功创建新 tab。
- 新 tab 的 source label 使用 `converted:<filename>`。
- 原有 Markdown file import 仍按原路径直读。
- PWA Markdown launchQueue 行为不变。

### Manual verification

本地准备样例文件：

- text-heavy PDF。
- DOCX，包含 headings、列表、表格。
- PPTX，包含标题和 bullets。
- XLSX，包含简单表格。
- HTML，包含 headings 和 links。
- CSV/JSON/XML。

手动确认：

- 转换入口可用。
- 成功结果进入 workspace tab。
- 预览、编辑、outline、share、export 仍可用。
- 错误文案清楚。
- 原 Markdown 文件导入和本地文件夹 workspace 不回归。

## 接受标准

1. 用户可以通过 Convert file 上传支持格式，并自动得到一个已打开且已加载转换后 Markdown 的新 tab。
2. text-heavy PDF 可以进入转换流程，且文案明确质量边界。
3. `.md/.markdown/.mdx/.txt` 直读导入不变。
4. 不支持格式、过大文件、转换失败、转换超时都有明确错误。
5. 服务端不持久化用户文件或转换结果，临时文件在请求结束后删除。
6. Converted tab 像现有 workspace tabs 一样在浏览器本地 best-effort 恢复，但不承诺跨设备或清理浏览器数据后的恢复。
7. API 不接受远程 URL。
8. 相关 unit/API/workspace tests 通过。
9. `npm run build` 通过。
10. 在生产环境可运行 MarkItDown 前，不宣称该能力已经上线完成。

## 后续扩展

只有当 MVP 使用数据证明需求成立后，再评估：

- 拖拽非 Markdown 文件触发转换。
- 批量转换队列。
- 转换结果下载 `.md`。
- 更强 PDF parser，例如 Marker、Docling、MinerU、Datalab、LlamaParse。
- 图片 OCR 和 LLM image captioning。
- URL 转换，但需要单独 SSRF、防下载炸弹、content-type 和域名策略设计。
- 独立转换微服务或 Docker 部署。

## 参考来源

- Microsoft MarkItDown: https://github.com/microsoft/markitdown
- MarkItDown supported formats: https://microsoft-markitdown.mintlify.app/formats/overview
- TO MD: https://tomd.io/
- MD Convert: https://mdconvert.net/
- Aspose Word to Markdown: https://products.aspose.app/words/conversion/word-to-markdown
- Marker / Datalab: https://github.com/datalab-to/marker
- Datalab document conversion docs: https://documentation.datalab.to/docs/welcome/sdk/conversion
- Docling: https://github.com/docling-project/docling
- MinerU: https://github.com/opendatalab/MinerU
