import fs from "node:fs";
import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot, type Plugin } from "vite";

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const getContentType = (filename: string) =>
  CONTENT_TYPES[path.extname(filename).toLowerCase()] ?? "application/octet-stream";

function serveSubAppDemoAssets(staticRoot: string): Plugin {
  return {
    name: "serve-sub-app-demo-assets",
    configureServer(server) {
      server.middlewares.use("/sub-app-demo", (req, res, next) => {
        const requestPath = req.url?.split("?")[0] ?? "/";
        const normalizedPath = decodeURIComponent(requestPath).replace(/^\/+/, "");
        const targetPath =
          normalizedPath === "" || normalizedPath.endsWith("/")
            ? path.join(staticRoot, normalizedPath, "index.html")
            : path.join(staticRoot, normalizedPath);

        const resolvedPath = path.resolve(targetPath);
        if (!resolvedPath.startsWith(path.resolve(staticRoot))) {
          res.statusCode = 403;
          res.end("Forbidden");
          return;
        }

        let filePath = resolvedPath;
        if (!fs.existsSync(filePath)) {
          next();
          return;
        }

        if (fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, "index.html");
          if (!fs.existsSync(filePath)) {
            next();
            return;
          }
        }

        res.setHeader("Content-Type", getContentType(filePath));
        fs.createReadStream(filePath).pipe(res);
      });
    },
  };
}

export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  const libraryRoot = path.resolve(__dirname, "../micro-panel-hub");
  const librarySourceRoot = path.resolve(libraryRoot, "main-app/src");
  const subAppDistRoot = path.resolve(libraryRoot, "dist/sub-app-demo");

  return {
    plugins: [
      react(),
      isDev ? serveSubAppDemoAssets(subAppDistRoot) : null,
    ],
    resolve: {
      alias: isDev
        ? [
            {
              find: /^@shupeixuan\/micro-panel-hub$/,
              replacement: path.resolve(librarySourceRoot, "lib.tsx"),
            },
            {
              find: /^@shupeixuan\/micro-panel-hub\/styles\.css$/,
              replacement: path.resolve(librarySourceRoot, "styles.css"),
            },
          ]
        : [],
    },
    server: {
      port: 5188,
      fs: {
        allow: [
          __dirname,
          libraryRoot,
          searchForWorkspaceRoot(__dirname),
        ],
      },
    },
    preview: {
      port: 5188,
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
