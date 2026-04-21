# Workspace Layout

这个仓库现在拆成两个主要目录：

- [`micro-panel-hub/`](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/micro-panel-hub): 真正的 npm 包源码、站点源码和构建入口
- [`demo-use-micro-panel-hub/`](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/demo-use-micro-panel-hub): 演示如何在自己的 React 项目里使用这个包

## 在哪里构建

所有和 `@shupeixuan/micro-panel-hub` 包本身相关的命令，都应该在子目录里执行：

```bash
cd micro-panel-hub
pnpm install
pnpm dev
pnpm build
pnpm build:lib
pnpm pack --dry-run
```

## Demo 项目

消费示例：

```bash
cd demo-use-micro-panel-hub
pnpm install
pnpm dev
```

这个 demo 通过本地依赖 `file:../micro-panel-hub` 来演示真实项目如何消费包。

## GitHub Actions

GitHub workflow 仍然保留在仓库根目录 `.github/workflows/`，但内部的安装、构建和发布路径已经改成指向 `micro-panel-hub/` 子目录。
