# sub-app-demo

`sub-app-demo/` 是 `@shupeixuan/micro-panel-hub` 自带的示例微应用，用来验证宿主工作区对嵌入子应用的加载、展示和交互能力。

## 在仓库中的角色

- 这是库包内部的一个演示子应用
- 构建输出会进入上层包目录的 `dist/sub-app-demo/`
- 库包在 `build:lib` 时会把该产物复制到 `lib/sub-app-demo/`
- 最终 npm 包会把 `lib/sub-app-demo/` 一起发布，供宿主项目按需静态托管

## 和 demo 宿主的关系

workspace 里的宿主示例项目是：

- [packages/demo-use-micro-panel-hub](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/packages/demo-use-micro-panel-hub)

开发时：

- workspace 根目录的 `pnpm dev` 会同时启动 demo 宿主和这里的构建监听
- demo 宿主会把上层库包目录中的 `dist/sub-app-demo/` 作为 `/sub-app-demo/` 静态资源目录提供出来

构建时：

- 先构建这里的静态资源
- 再由上层库包复制到 `lib/sub-app-demo/`
- 最后 demo 宿主把 `lib/sub-app-demo/` 再复制到自己的 `dist/sub-app-demo/`

## 常见命令

通常还是推荐从 workspace 根目录执行：

```bash
pnpm dev
pnpm build
```

如果只想单独构建这个示例子应用：

```bash
pnpm --dir packages/micro-panel-hub/sub-app-demo build
```

## 说明

这个目录是库包附带的示例资产，不是单独发布到 npm 的独立包。
