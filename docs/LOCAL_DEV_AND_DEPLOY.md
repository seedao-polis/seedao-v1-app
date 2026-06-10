# SeeDAO 前端：依赖说明与本地开发 / 部署指引

本文档整理本仓库（`os-frontend` / Create React App）从**依赖服务**、**环境变量**到**安装、启动、构建与部署**的步骤，便于新成员与本地联调后端时使用。

---

## 1. 项目是什么

- **类型**：React 18 + `react-app-rewired` + TypeScript 的单页应用。
- **主脚本**：`npm run dev` / `pnpm run dev` → `react-app-rewired start`（开发服务器，默认端口一般为 **3000**）。
- **业务配置入口**：`src/utils/envCofnig.ts` 中的 `getConfig()`，按 `REACT_APP_ENV_VERSION` 选择不同环境的后端与第三方地址。

---

## 2. 环境与工具

| 项 | 说明 |
|----|------|
| Node.js | 建议使用与团队一致的 LTS；需能运行 `react-scripts@5`。 |
| 包管理器 | **npm** 或 **pnpm** 均可；仓库根目录 `.npmrc` 已针对两者做了常见兼容配置。 |

---

## 3. 依赖哪些「服务」（是否必须自建）

前端通过 HTTP/HTTPS 访问远端或本地服务。**不是**所有服务都要在你机器上部署，可按功能裁剪。

### 3.1 主业务后端（通常必连）

- **用途**：登录、用户、CityHall、大量业务接口等（axios `baseURL`）。
- **配置**：`REACT_APP_BASE_ENDPOINT` + `REACT_APP_API_VERSION`（一般为 `v1`）。
- **本地联调**：将 `REACT_APP_BASE_ENDPOINT` 指向本机 OS Backend，例如 `http://127.0.0.1:8080`（**不要**末尾斜杠；端口以你本机为准）。
- **注意**：浏览器请求本地后端时，后端需配置 **CORS**，允许前端源（如 `http://localhost:3000`）。

### 3.2 Push 服务（可选）

- **用途**：推送注册、设备语言等（见 `src/requests/push.ts`）。
- **配置**：`REACT_APP_PUSH_ENDPOINT`（在 `getConfig()` 各环境中定义）。
- **不部署**：多数页面仍可打开；推送相关功能可能不可用或报错。

### 3.3 SBT API（可选）

- **用途**：SBT 铸造、审核、上传等（`SBT_BASEURL`）。
- **不部署**：不涉及 SBT 的流程可跳过。

### 3.4 Indexer（SPP Indexer）（可选）

- **用途**：借贷/金库等 `score_lend` 数据（`INDEXER_ENDPOINT`，见 `src/requests/credit.ts`）。
- **不部署**：不使用相关页面可不启。

### 3.5 论坛 / Metaforo / Deschool 等

- **用途**：提案、论坛、第三方登录等；代码中多为**固定公网 URL**。
- **一般**：无需你本地部署，需能访问外网。

### 3.6 链上 RPC、OneSignal、Sentry

- **链上 RPC**：使用公共或团队提供的 RPC 即可，通常无需自建节点。
- **OneSignal / Sentry**：第三方；开发阶段可忽略或按环境配置。

---

## 4. 环境变量说明（开发时常用）

Create React App 会加载 `.env`、`.env.local`、`.env.development`、`.env.development.local` 等；**仅 `REACT_APP_*` 会注入到前端代码**。

| 变量 | 作用 |
|------|------|
| `REACT_APP_API_VERSION` | API 路径前缀，一般为 `v1`。 |
| `REACT_APP_BASE_ENDPOINT` | **主业务后端根地址**；在 `LOCAL` 配置中已支持从环境变量读取，便于指向本机后端。 |
| `REACT_APP_ENV_VERSION` | 未设置或空：走 **LOCAL**；`dev` / `preview` / `prod` 分别对应 `getConfig()` 中 **DEVELOPMENT** / **PREVIEW** / **PRODUCTION**。 |
| `DISABLE_ESLINT_PLUGIN` | 设为 `true` 可关闭 webpack 内 ESLint（**仅作排障兜底**，一般不长期开启）。 |

**说明**：日常 `pnpm run dev` / `npm run dev` **未**在脚本里写死 `REACT_APP_ENV_VERSION`，因此默认是 **LOCAL**，再叠加 `.env.local` 中的 `REACT_APP_*`。

---

## 5. 本地开发：推荐步骤

### 5.1 获取代码与安装依赖

```bash
git clone <仓库地址>
cd seedao-app
```

使用 **npm**：

```bash
npm install
```

使用 **pnpm**（推荐与团队统一；仓库已含 `.npmrc`）：

```bash
pnpm install
```

若修改过 `.npmrc` 中与 pnpm 目录结构相关的项（例如 `shamefully-hoist`），建议重装：

```bash
rm -rf node_modules
pnpm install
```

### 5.2 配置 `.env.local`

复制或编辑项目根目录 `.env.local`（勿将含密钥的文件提交到 Git）：

- 设置 `REACT_APP_API_VERSION=v1`（与后端一致）。
- 设置 `REACT_APP_BASE_ENDPOINT=http://127.0.0.1:<端口>` 指向本地 OS Backend（端口以后端启动日志为准）。

修改 `.env.local` 后需**重启**开发服务器。

### 5.3 启动本地 OS Backend

在后端仓库中按后端文档启动；从控制台或配置中确认监听地址，例如 `http://127.0.0.1:8080`，将上述 `REACT_APP_BASE_ENDPOINT` 与之对齐。

### 5.4 启动前端

```bash
npm run dev
# 或
pnpm run dev
```

浏览器访问开发服务器提示的地址（通常为 `http://localhost:3000`）。

---

## 6. 常见问题

### 6.1 `npm install` 报 `ERESOLVE`（peer 依赖冲突）

- 原因：`@taoist-labs/components` 的 peer 仍声明为 `@seedao/sns-js`，与项目使用的 `@seedao2.0/sns-js` 命名不一致等（`package.json` 的 `overrides` 会将前者解析到后者）。
- 处理：仓库 `.npmrc` 已设置 `legacy-peer-deps=true`；亦可手动执行 `npm install --legacy-peer-deps`。

### 6.2 pnpm 安装慢或超时

- 多为镜像或网络问题；可重试、换网络，或临时指定 registry，例如：  
  `pnpm install --registry https://registry.npmjs.org/`

### 6.3 启动时报 ESLint `Plugin "react" was conflicted`

- 常见于 **pnpm + CRA** 下 ESLint 插件多路径解析。
- 处理：仓库 `.npmrc` 已设置 `strict-peer-dependencies=false` 与 `shamefully-hoist=true`；按 **5.1** 重装依赖后再启动。
- 仍失败时可临时在 `.env.local` 增加 `DISABLE_ESLINT_PLUGIN=true` 仅用于排障。

### 6.4 大量 `Failed to parse source map` 警告

- 多为依赖包内 source map 指向未发布的文件，**一般可忽略**。
- 仓库 `config-overrides.js` 中已尽量抑制此类告警；不影响正常运行。

### 6.5 接口跨域（CORS）

- 前端访问 `http://127.0.0.1:<后端端口>` 若被浏览器拦截，需在后端配置允许的来源（含 `http://localhost:3000` 等）。

---

## 7. 构建与部署

### 7.1 构建命令（见 `package.json`）

| 命令 | 说明 |
|------|------|
| `npm run build` | `REACT_APP_ENV_VERSION=dev`，对应开发/测试向构建。 |
| `npm run build:preview` | `preview` 环境。 |
| `npm run build:prod` | `prod` 环境。 |

构建产物目录一般为 `build/`，可交由静态托管（如 Netlify 等；仓库 `README.md` 中有线上部署链接说明）。

### 7.2 与线上环境对齐

- 生产构建应使用与线上一致的 `REACT_APP_ENV_VERSION` 及后端域名；具体以运维/发布流程为准。

---

## 8. 相关文件速查

| 文件 | 作用 |
|------|------|
| `package.json` | 脚本与依赖。 |
| `.npmrc` | npm/pnpm 安装与 peer、pnpm 目录策略。 |
| `.env.local` | 本地环境变量（建议勿提交密钥）。 |
| `src/utils/envCofnig.ts` | 各环境后端与第三方 URL 汇总。 |
| `src/requests/http.ts` | 主 API axios `baseURL`。 |
| `config-overrides.js` | webpack 覆写（polyfill、忽略部分告警等）。 |

---

## 9. 备份与恢复 `.env.local`

若曾对 `.env.local` 做备份（例如 `.env.local.backup`），恢复可参考：

```bash
cp .env.local.backup .env.local
```

再根据本机端口与密钥调整内容。
