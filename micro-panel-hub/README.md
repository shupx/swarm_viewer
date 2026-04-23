# micro-panel-hub Package Build

micro-panel-hub is a micro-frontend workspace library built with `qiankun` and `flexlayout-react`. It is published as the npm package `@shupeixuan/micro-panel-hub` for embedding into other React projects.

Live preview of the demo that uses micro-panel-hub: [https://shupx.github.io/micro-panel-hub/](https://shupx.github.io/micro-panel-hub/)

## Project Structure

- `main-app/`: library entry code and internal UI logic
- `sub-app-demo/`: built-in sample micro app source used to validate library behavior
- `lib/`: npm package output directory

## Library Build

Install dependencies:

```bash
pnpm install
```

Build the npm library:

```bash
pnpm build
```

Inspect the npm package contents:

```bash
pnpm pack --dry-run
```

## Public API Table

| Export | Type | Purpose | Notes |
| --- | --- | --- | --- |
| `MicroPanelHub` | React component | Renders the workspace directly inside a React app | Requires explicit style import |
| `mountMicroPanelHub` | Function | Mounts the workspace into a DOM container imperatively | Still rendered internally with React |
| `getDefaultEventBus` | Function | Returns the default event bus instance | Useful for sharing the message channel with the host |
| `createSubAppDemoPanel` | Function | Creates a panel definition for the packaged demo micro app | Host apps still need to serve the packaged static assets |
| `MicroPanelHubProps` | Type | Component props type | Main component configuration entry |
| `MicroPanelHubMountOptions` | Type | Parameter type for `mountMicroPanelHub` | Mostly aligned with the component props |
| `MicroPanelDefinition` | Type | Default panel definition type | Used by `defaultPanels` |
| `MicroPanelAddMenuOptions` | Type | Add menu configuration type | Controls preset items, custom app, and recent history |
| `MicroAppSource` | Type | Child app source configuration type | Supports absolute and relative routes |
| `MicroPanelHubEventBus` | Type | Event bus type | Based on `mitt` |
| `@shupeixuan/micro-panel-hub/styles.css` | Style entry | Imports the component styles | Recommended for host apps |
| `@shupeixuan/micro-panel-hub/flexlayout-light.css` | Style entry | Imports the default FlexLayout theme styles | Useful when the host wants explicit control |

## Main Configuration Options

- `title`
- `defaultPanels`
- `addMenu`
- `defaultCustomAppName`
- `defaultRelativeRoute`
- `storageKey`
- `eventBus`
- `className`

To run the page demo, use the sibling directory `../demo-use-micro-panel-hub/`.

## Using It As An npm Package

Install:

```bash
pnpm add @shupeixuan/micro-panel-hub react react-dom
```

Component usage:

```tsx
import {
  createSubAppDemoPanel,
  MicroPanelHub,
} from "@shupeixuan/micro-panel-hub";
import "@shupeixuan/micro-panel-hub/styles.css";

export function Demo() {
  return (
    <div style={{ height: "100vh" }}>
      <MicroPanelHub
        title="Embedded Micro Panel Hub"
        defaultPanels={[createSubAppDemoPanel()]}
        addMenu={{
          panels: [
            createSubAppDemoPanel(),
            createSubAppDemoPanel({
              name: "sub-app-demo (site route)",
              sourceMode: "site-relative-route",
            }),
          ],
          enableCustomApp: true,
          enableRecent: true,
          recentLimit: 8,
        }}
        storageKey="embedded_micro_panel_hub_layout"
      />
    </div>
  );
}
```

`addMenu.panels` overrides `defaultPanels` when both are provided. This lets hosts keep backward compatibility while moving to the more explicit Add menu API.

Recent history is stored in `localStorage` under `${storageKey}__recent_panels`. It records panels opened from the Add menu, including custom URLs, deduplicates by normalized source, and shows the newest entries inline in the Add dropdown.

## Optional Packaged Demo Micro App

The npm package includes a built demo micro app under:

```text
node_modules/@shupeixuan/micro-panel-hub/lib/sub-app-demo/
```

This directory contains static files, so importing the npm package is not enough to make the route available in the browser. Host applications that want to expose the packaged demo should copy or serve that directory at the route used by the panel definition, for example `/sub-app-demo/`.

Webpack dev server example:

```js
devServer: {
  static: {
    directory: path.resolve(
      __dirname,
      "node_modules/@shupeixuan/micro-panel-hub/lib",
    ),
    publicPath: "/",
  },
}
```

Production build example:

```bash
mkdir -p dist/sub-app-demo
cp -R node_modules/@shupeixuan/micro-panel-hub/lib/sub-app-demo/. dist/sub-app-demo/
```

If the assets are served from a different path, pass that path to the helper:

```tsx
createSubAppDemoPanel({ route: "/docs/sub-app-demo/" })
```

Imperative mount usage:

```ts
import { mountMicroPanelHub } from "@shupeixuan/micro-panel-hub";
import "@shupeixuan/micro-panel-hub/styles.css";

const mounted = mountMicroPanelHub(document.getElementById("root")!, {
  title: "Embedded Micro Panel Hub",
});

mounted.unmount();
```

## Manual Packaging And Publishing To npmjs

1. Log in with the npm publishing identity for `@shupeixuan`. Generate `token with bypass 2FA enabled` first on https://www.npmjs.com/settings/shupeixuan/tokens.

    ```bash
    npm login
    # set access token for publish
    npm config set //registry.npmjs.org/:_authToken={Your Token}
    ```

2. Install dependencies and build the publishable output.

    ```bash
    pnpm install
    pnpm build:lib
    ```

3. Inspect the package contents before publishing.

    ```bash
    pnpm pack --dry-run
    ```

4. If you want to publish a specific nightly/dev version, update the root `package.json` version first, for example:

    ```text
    1.0.0-dev.20260421.01
    ```

    Version format convention:

    ```text
    1.0.0-dev.YYYYMMDD.SEQ
    ```
    Where `YYYYMMDD` is the UTC date and `SEQ` is the zero-padded daily sequence of the current nightly workflow run, ordered by `created_at` within that UTC day.

5. Publish a dev version manually.

    ```bash
    npm publish --access public --tag dev
    
    # use {--tag dev} because 1.0.0-dev.20260421.01 is a dev version
    ```
    
    This step needs 2FA authentiation or access token set.



## GitHub Actions npm Token Setup

Before enabling automatic nightly publishing, complete the following setup:

1. Create an npm access token for the `@shupeixuan` publishing account with publish permission.
2. Add the token to the GitHub repository or `npm` environment as the secret `NPM_TOKEN`.
3. Confirm that the scoped package visibility is public before the first release.
4. The nightly workflow publishes with `npm publish --access public --tag dev` using `NODE_AUTH_TOKEN`.

## Current Defaults

- Default title: `Micro Panel Hub`
- Default panels: none. Hosts should deploy their own micro apps and pass `defaultPanels` when they want an app to appear in the Add menu.
- Default custom app route placeholder: `/sub-app-demo/`
- Default layout storage key: `micro_panel_hub_layout`
- Default exported layout filename: `micro-panel-hub-layout.json`
- Default Add menu settings: `enableCustomApp = true`, `enableRecent = true`, `recentLimit = 8`
