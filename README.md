# Swarm Viewer

Swarm Viewer 是一个轻量的基于**微前端架构**（qiankun）建设的容器型平台（纯前端项目），用来将子前端应用（独立部署在各自的地址）插入到这个主容器平台。

它借鉴了 Foxglove Studio 和 VS Code 的设计理念，支持复杂的窗口拖拽、面板拆分（分屏）和标签页管理（通过 `flexlayout-react` 实现），非常适合搭建集成化工具台。

一个线上部署： [https://shupx.github.io/swarm_viewer/](https://shupx.github.io/swarm_viewer/)

dist构建下载：[https://github.com/shupx/swarm_viewer/releases/tag/latest](https://github.com/shupx/swarm_viewer/releases/tag/latest)

![image-20260420151726688](misc/main.png)

## 项目结构

- `main-app/`: 基座主应用（Webpack + React）。提供全局布局框架、菜单栏、微前端组件加载器 (`MicroAppRenderer`)，以及基于 `mitt` 开发的全局事件总线。
- `sub-app-demo/`: 示例子应用（Webpack + React），并展示接收主应用下发的 `eventBus` 实现跨应用、跨组件的通信联动。注意qiankun限制子应用只能由webpack构建，vite构建有社区方案但支持很差！
- `start.sh`: 开发模式，一键启动主应用开发服务器，并在后台 watch 构建示例子应用；主应用会把子应用 `dist` 挂载到 `/sub-app-demo/`。

## ⚙️ 第一步：安装依赖

在初次运行项目之前，在项目根目录安装依赖即可：

```bash
pnpm install
```

## 🚀 第二步：开发与运行

现在推荐直接在项目根目录执行统一脚本。

### 方式一：使用一键启动脚本（推荐）

回到项目根目录（`swarm_viewer`），运行脚本：

```bash
pnpm dev
```

> **注意：** 该命令会启动主应用开发服务器，并 watch 构建子应用到项目根目录的 `dist/sub-app-demo`；主应用与子应用最终产物统一输出到项目根目录 `dist/`。
> 启动成功后，浏览器访问：**http://localhost:5173**

如需指定主应用端口，可以在根目录传参：

```bash
pnpm dev -- --port 5180
```

### 方式二：统一构建

在项目根目录执行：

```bash
pnpm build
```

> 该命令会先构建 `sub-app-demo`，再构建 `main-app`，并把最终产物统一输出到项目根目录 `dist/`。

### 方式三：统一检查

在项目根目录执行：

```bash
pnpm lint
```

> 当前 lint 可以通过，但 Node 会对 `eslint.config.js` 输出 ESM 解析 warning；这不会影响检查结果。

### 方式四：手动独立启动

如果需要看独立的日志或者排查问题，可以打开两个终端分别启动：

**终端 1（主应用）**
```bash
cd main-app
npm run dev
```
> 主应用将在 `5173` 端口运行。

**终端 2（子应用 watch 构建）**
```bash
cd sub-app-demo
npm run dev
```
> 子应用不再单独提供 `5174` 服务，而是输出到项目根目录的 `dist/sub-app-demo`，由主应用同站点托管为 `http://localhost:5173/sub-app-demo/`。

## 💡 功能验证与体验指南

1. **添加微应用面板**：在页面顶部浏览器导航栏，点击 **"Add Sub-App Demo"** 按钮，您将在主工作区看到一个新的 Tab，里面渲染了微应用实例。
2. **面板切割（分屏）与组合**：点击多次按钮生成多个子应用后，您可以**按住选项卡的标签名称拖动**，靠近页面的上下左右边缘框线松手，即可实现自由切割、分屏或变成 Tab 组。
3. **事件总线通信（mitt）**：
   - 试着在一个子应用面板的文字框输入消息，并点击 **"Send Broadcast"**。
   - 所有挂载的子应用面板中的列表，以及右上角主应用顶栏都会同步收到该广播消息，验证了微应用与主应用的事件互通。
