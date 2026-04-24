# Demo Use Micro Panel Hub

这个示例项目演示如何在自己的 React + Webpack 项目中消费本地包 `@shupeixuan/micro-panel-hub`。当前页面运行、构建和调用流程都放在这个 demo 项目里。

这个仓库现在使用 pnpm workspace monorepo 管理：

- 开发时，demo 通过 webpack alias 直接引用 `../micro-panel-hub/main-app/src/` 源码，不需要先构建库的 `lib/`
- 构建时，workspace 会先构建 `packages/micro-panel-hub/lib/`，再构建 demo
- 发布时，`@shupeixuan/micro-panel-hub` 仍然只发布 `lib/`

## 运行

推荐从 workspace 根目录运行：

```bash
pnpm install
pnpm dev
```

如果只想单独启动 demo，也可以在当前目录运行：

```bash
pnpm dev
```

当前通过 workspace 依赖：

```text
workspace:../micro-panel-hub
```

来引入包。开发模式会直接消费库源码；生产构建会消费已构建好的库产物。

更具体地说：

- `pnpm dev` 时，webpack 会把 `@shupeixuan/micro-panel-hub` alias 到 `../micro-panel-hub/main-app/src/lib.tsx`
- `pnpm dev` 时，`@shupeixuan/micro-panel-hub/styles.css` 会 alias 到 `../micro-panel-hub/main-app/src/styles.css`
- `pnpm dev` 不会先构建 `../micro-panel-hub/lib/`
- `pnpm build` 时，这些 alias 会关闭，demo 会按包入口解析 `@shupeixuan/micro-panel-hub`，实际消费 `../micro-panel-hub/lib/` 产物

所以：

- `pnpm dev` 适合快速联调和验证源码行为
- `pnpm build` 更适合验证真实发布包的消费效果

另外，这个 demo 页面里的默认示例子应用路由是 `/sub-app-demo/`。`@shupeixuan/micro-panel-hub` 包会提供一份构建好的可选示例子应用资产：

```text
node_modules/@shupeixuan/micro-panel-hub/lib/sub-app-demo/
```

这个 demo 工程会通过 `createSubAppDemoPanel()` 显式把示例子应用传给 `MicroPanelHub`：

- 开发时，demo 的 webpack dev server 会把兄弟库包里的 `dist/sub-app-demo/` 作为静态目录一起提供
- 生产构建时，demo 会把兄弟库包里的 `lib/sub-app-demo/` 复制到 `dist/sub-app-demo/`
- 示例代码同时演示了 `addMenu` API，可以在 `Add` 菜单中放多个预置项，并在下拉菜单里直接显示 recent 历史

这样 `Add -> sub-app-demo` 时，页面才能真正访问到 `/sub-app-demo/` 这个入口。普通使用方如果也想使用这个示例子应用，也需要把包里的静态目录部署到自己的站点上。
