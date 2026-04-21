# micro-panel-hub

micro-panel-hub is a micro-frontend workspace library built with `qiankun` and `flexlayout-react`. It is published as the npm package `@shupeixuan/micro-panel-hub` for embedding into other React projects.

Live preview of the demo that uses micro-panel-hub: [https://shupx.github.io/micro-panel-hub/](https://shupx.github.io/micro-panel-hub/)

![Micro Panel Hub screenshot](misc/main.png)

## Project Structure

- [`micro-panel-hub/`](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/micro-panel-hub): the pure library package source and npm build entry
- [`demo-use-micro-panel-hub/`](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/demo-use-micro-panel-hub): an example project showing how to use the package in your own React app, and also the place where the demo page is run and built

### Build The Package

All commands related to the `@shupeixuan/micro-panel-hub` package itself should be run inside the subdirectory:

```bash
cd micro-panel-hub
pnpm install
pnpm build
pnpm build:lib
pnpm pack --dry-run
```

### Demo Project

Page development and page builds are handled in the demo directory:

```bash
cd demo-use-micro-panel-hub
pnpm install
pnpm dev
pnpm build
```

This demo uses the local dependency `file:../micro-panel-hub` to show how a real project can consume the package, and its scripts build the library before starting or bundling the page.

## GitHub Actions

Inside `.github/workflows/`:

- `deploy-pages.yml`: builds and deploys `demo-use-micro-panel-hub/` to GitHub Pages
- `nightly-build.yml`: builds the `micro-panel-hub` npm package, publishes it to npmjs, and updates the nightly release flow

## Development

See [micro-panel-hub/README.md](/home/spx/spx_ws/swarm_viewer_dev/micro-panel-hub/micro-panel-hub/README.md)
