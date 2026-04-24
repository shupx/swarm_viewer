# micro-panel-hub

`micro-panel-hub` is a micro-frontend workspace library built with `qiankun` and `flexlayout-react`. It is published as the npm package `@shupeixuan/micro-panel-hub` for embedding into host applications. The host app does not have to be written with React, but the current implementation is still rendered internally with React and therefore requires `react` and `react-dom` at runtime.

Live preview of the demo app: [https://shupx.github.io/micro-panel-hub/](https://shupx.github.io/micro-panel-hub/)

![Micro Panel Hub screenshot](misc/main.png)

## Monorepo Structure

This repository is managed as a `pnpm` workspace monorepo:

- [packages/micro-panel-hub](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/packages/micro-panel-hub): the publishable library package
- [packages/demo-use-micro-panel-hub](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/packages/demo-use-micro-panel-hub): the Vite demo host app that consumes the library

The library package itself still contains:

- `main-app/`: the main source implementation for the exported library API
- `sub-app-demo/`: the built-in sample micro app used by the library and demo
- `lib/`: the publishable package output

## Development Model

The workspace now uses two different modes on purpose:

- Development: the demo app resolves `@shupeixuan/micro-panel-hub` to library source code through webpack alias, so library edits take effect immediately without rebuilding `lib`
- Build and publish: the library is built first and outputs `lib/`, then the demo build consumes the built package output

This keeps local iteration fast while preserving a clean npm publish flow.

More explicitly:

- `pnpm dev`: `packages/demo-use-micro-panel-hub` uses `packages/micro-panel-hub/main-app/src/` through Vite alias, so this mode validates source-level behavior and fast local integration
- `pnpm build`: `packages/micro-panel-hub` builds `lib/` first, then `packages/demo-use-micro-panel-hub` builds in production mode without the source alias, so this mode validates the packaged library output

## Workspace Commands

Install dependencies once from the repository root:

```bash
pnpm install
```

Start development:

```bash
pnpm dev
```

This runs the demo host app together with the library-side demo micro app build/watch flow.
It does not build `packages/micro-panel-hub/lib/` as part of the normal dev loop.

Build everything in order:

```bash
pnpm build
```

This runs:

1. `@shupeixuan/micro-panel-hub` build (outputs: `packages/micro-panel-hub/lib` and `packages/micro-panel-hub/dist/sub-app-demo`)
2. `demo-use-micro-panel-hub` build (outputs: `packages/demo-use-micro-panel-hub/dist`)

In this flow, the demo build consumes the library package `lib/` output rather than the source alias.

Preview the demo app production build locally:

```bash
pnpm preview
```

## Package-Level Commands

If you only want to build the publishable library package:

```bash
cd packages/micro-panel-hub
pnpm build
pnpm pack --dry-run
```

If you only want to run the demo app package directly:

```bash
cd packages/demo-use-micro-panel-hub
pnpm dev

# for production:
pnpm build
pnpm preview
```

## Publish Flow

Recommended flow:

```bash
pnpm build
```

Then publish only the library package:

```bash
cd packages/micro-panel-hub
npm publish --access public --tag dev
```

The published npm package includes `lib/`, `README.md`, and `LICENSE`, and does not publish the full workspace source tree.

## GitHub Actions

Inside [.github/workflows](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/.github/workflows):

- `deploy-pages.yml`: installs the workspace, builds it from the root, and deploys `packages/demo-use-micro-panel-hub/dist`
- `nightly-build.yml`: builds and packages `packages/micro-panel-hub`, then publishes the nightly npm package and release artifacts

## More Documentation

- Library package docs: [packages/micro-panel-hub/README.md](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/packages/micro-panel-hub/README.md)
- Demo package docs: [packages/demo-use-micro-panel-hub/README.md](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/packages/demo-use-micro-panel-hub/README.md)
