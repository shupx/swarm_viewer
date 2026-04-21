# micro-panel-hub

micro-panel-hub 是一个基于 `qiankun` 和 `flexlayout-react` 构建的微前端工作台库包，以 npm 包 `@shupeixuan/micro-panel-hub` 的形式提供给其他 React 项目嵌入使用。

调用micro-panel-hub的demo在线预览：[https://shupx.github.io/micro-panel-hub/](https://shupx.github.io/micro-panel-hub/)

![Micro Panel Hub screenshot](misc/main.png)

## 项目结构

- [`micro-panel-hub/`](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/micro-panel-hub): 纯库包源码与 npm 构建入口
- [`demo-use-micro-panel-hub/`](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/demo-use-micro-panel-hub): 演示如何在自己的 React 项目里使用这个包，同时承担页面运行与构建

### 构建包

所有和 `@shupeixuan/micro-panel-hub` 包本身相关的命令，都应该在子目录里执行：

```bash
cd micro-panel-hub
pnpm install
pnpm build
pnpm build:lib
pnpm pack --dry-run
```

### Demo 项目

页面运行和构建都放在 demo 目录：

```bash
cd demo-use-micro-panel-hub
pnpm install
pnpm dev
pnpm build
```

这个 demo 通过本地依赖 `file:../micro-panel-hub` 来演示真实项目如何消费包，并在自己的脚本里先构建库再启动/打包页面。

## GitHub Actions

 `.github/workflows/`中：

- `deploy-pages.yml`:   构建和部署 `demo-use-micro-panel-hub/` 到GitHub Pages；
- `nightly-build.yml`: 构建`micro-panel-hub`npm包，并上传到npmjs，发布到nightly标签release。

## 开发

参考[micro-panel-hub/README.md](micro-panel-hub/README.md)
