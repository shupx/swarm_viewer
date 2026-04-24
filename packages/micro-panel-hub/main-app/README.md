# main-app

`main-app/` 是 `@shupeixuan/micro-panel-hub` 的核心源码目录，负责导出的 React 组件、挂载入口、布局状态管理，以及微前端工作区的主要 UI。

## 在仓库中的角色

- `src/lib.tsx`: 库对外导出的源码入口
- `src/mount.tsx`: React 组件导出与 imperative mount 入口
- `src/App.tsx`: 主工作区壳层
- `src/components/`: 工作区与微应用渲染相关组件
- `src/utils/`: layout、panel、path、event bus 等辅助逻辑
- `src/styles.css`: 提供给 demo 开发态 alias 使用的源码样式聚合入口

## 和 monorepo/workspace 的关系

当前仓库使用 pnpm workspace：

- 开发时，`packages/demo-use-micro-panel-hub` 会通过 webpack alias 直接引用这里的源码
- 构建库包时，`packages/micro-panel-hub/tsup.config.ts` 会以 `src/lib.tsx` 为入口打包到 `../lib/`
- 发布到 npm 时，真正对外发布的是上层包目录里的 `lib/` 产物，而不是这个目录本身

## 常见开发方式

通常不需要单独在这个目录运行命令。推荐从 workspace 根目录执行：

```bash
pnpm dev
pnpm build
```

如果只想检查上层库包构建：

```bash
cd ..
pnpm build
```

## 说明

这个目录虽然叫 `main-app`，但它现在承担的是“库源码实现层”的职责，不是独立发布的应用包。
