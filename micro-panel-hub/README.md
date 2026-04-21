# micro-panel-hub Package Build

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
| `MicroPanelHubProps` | Type | Component props type | Main component configuration entry |
| `MicroPanelHubMountOptions` | Type | Parameter type for `mountMicroPanelHub` | Mostly aligned with the component props |
| `MicroPanelDefinition` | Type | Default panel definition type | Used by `defaultPanels` |
| `MicroAppSource` | Type | Child app source configuration type | Supports absolute and relative routes |
| `MicroPanelHubEventBus` | Type | Event bus type | Based on `mitt` |
| `@shupeixuan/micro-panel-hub/styles.css` | Style entry | Imports the complete package styles | Recommended for host apps |
| `@shupeixuan/micro-panel-hub/flexlayout-light.css` | Style entry | Imports the default FlexLayout theme styles | Useful when the host wants explicit control |

## Main Configuration Options

- `title`
- `defaultPanels`
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
import { MicroPanelHub } from "@shupeixuan/micro-panel-hub";
import "@shupeixuan/micro-panel-hub/styles.css";

export function Demo() {
  return (
    <div style={{ height: "100vh" }}>
      <MicroPanelHub
        title="Embedded Micro Panel Hub"
        defaultRelativeRoute="/sub-app-demo/"
        storageKey="embedded_micro_panel_hub_layout"
      />
    </div>
  );
}
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

1. Log in with the npm publishing identity for `@shupeixuan`.

```bash
npm login
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

4. Publish a dev version manually.

```bash
npm publish --access public
```

5. If you want to publish a specific nightly/dev version, update the root `package.json` version first, for example:

```text
1.0.0-dev.20260421.01
```

Version format convention:

```text
1.0.0-dev.YYYYMMDD.SEQ
```

Where `YYYYMMDD` is the UTC date and `SEQ` is a two-digit sequence such as `01`, `02`, and so on.

## GitHub Actions Trusted Publishing Setup

Before enabling automatic nightly publishing, complete the following setup:

1. Add a GitHub Trusted Publisher in the npm package settings for `@shupeixuan/micro-panel-hub`.
2. Make sure the GitHub repository is connected to the same repository path shown on the npm package page.
3. Create an `npm` environment in GitHub for the nightly workflow.
4. Confirm that the scoped package visibility is public before the first release.
5. The nightly workflow uses Node `22.14+` and npm `11.5.1+` to satisfy the current Trusted Publishing requirements.

## Current Defaults

- Default title: `Micro Panel Hub`
- Default sample child app route: `/sub-app-demo/`
- Default layout storage key: `micro_panel_hub_layout`
- Default exported layout filename: `micro-panel-hub-layout.json`
