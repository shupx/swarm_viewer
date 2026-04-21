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

这是因为 `file:` 目录依赖在 `pnpm install` 后会使用安装时的包产物快照。只重新构建 `../micro-panel-hub` 并不会自动刷新 demo 里的 `node_modules/@shupeixuan/micro-panel-hub`，像 `styles.css` 这类产物就可能还是旧版本，表现出来就是页面结构更新了，但样式没有跟上。
