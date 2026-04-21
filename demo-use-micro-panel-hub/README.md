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

来引入包；`pnpm dev` 和 `pnpm build` 都会先调用兄弟目录中的库构建。
