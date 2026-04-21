# Demo Use Micro Panel Hub

这个示例项目演示如何在自己的 React + Webpack 项目中消费本地包 `@shupeixuan/micro-panel-hub`。

## 运行

先进入真正的包目录并构建库：

```bash
cd ../micro-panel-hub
pnpm install
pnpm build:lib
```

然后回到当前目录启动 demo：

```bash
cd ../demo-use-micro-panel-hub
pnpm install
pnpm dev
```

当前通过本地依赖：

```text
file:../micro-panel-hub
```

来引入包。
