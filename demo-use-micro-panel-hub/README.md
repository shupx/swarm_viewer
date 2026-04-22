# Demo Use Micro Panel Hub

这个示例项目演示如何在自己的 React + Webpack 项目中消费本地包 `@shupeixuan/micro-panel-hub`。当前页面运行、构建和调用流程都放在这个 demo 项目里。

## 运行

在当前目录直接安装并启动 demo：

```bash
pnpm install
pnpm dev
```

当前通过本地依赖：

```text
file:../micro-panel-hub
```

来引入包；`pnpm dev` 和 `pnpm build` 都会先调用兄弟目录中的库构建，再执行一次本地依赖同步。



另外，这个 demo 页面里的默认示例子应用路由是 `/sub-app-demo/`。`@shupeixuan/micro-panel-hub` 包会提供一份构建好的可选示例子应用资产：

```text
node_modules/@shupeixuan/micro-panel-hub/lib/sub-app-demo/
```

这个 demo 工程会通过 `createSubAppDemoPanel()` 显式把示例子应用传给 `MicroPanelHub`：

- 开发时，demo 的 webpack dev server 会把包内的 `lib/sub-app-demo/` 作为静态目录一起提供
- 生产构建时，demo 会把包内的 `lib/sub-app-demo/` 复制到 `demo-use-micro-panel-hub/dist/sub-app-demo/`

这样 `Add -> sub-app-demo` 时，页面才能真正访问到 `/sub-app-demo/` 这个入口。普通使用方如果也想使用这个示例子应用，也需要把包里的静态目录部署到自己的站点上。
