const fs = require('fs');
const path = require('path');

const webpackDeps = {
  "webpack": "^5.89.0",
  "webpack-cli": "^5.1.4",
  "webpack-dev-server": "^4.15.1",
  "html-webpack-plugin": "^5.5.3",
  "babel-loader": "^9.1.3",
  "@babel/core": "^7.23.6",
  "@babel/preset-env": "^7.23.6",
  "@babel/preset-react": "^7.23.3",
  "@babel/preset-typescript": "^7.23.3",
  "style-loader": "^3.3.3",
  "css-loader": "^6.8.1"
};

function migrateApp(appDir, isSubApp) {
  const pkgPath = path.join(appDir, 'package.json');
  let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  delete pkg.devDependencies['vite'];
  delete pkg.devDependencies['@vitejs/plugin-react'];
  
  if (isSubApp) {
    delete pkg.devDependencies['vite-plugin-qiankun'];
  }

  pkg.scripts.dev = "webpack serve --mode development";
  pkg.scripts.build = "webpack --mode production";
  
  pkg.devDependencies = { ...pkg.devDependencies, ...webpackDeps };
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  const htmlPath = path.join(appDir, 'index.html');
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    html = html.replace(/<script[^>]*src="\/src\/main\.tsx"[^>]*><\/script>/g, '');
    html = html.replace(/<script[^>]*import.*\/src\/main\.tsx.*<\/script>/g, '');
    html = html.replace(/<script[^>]*createDeffer.*<\/script>/s, '');
    fs.writeFileSync(htmlPath, html);
  }

  const webpackConfig = `const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
${isSubApp ? "const { name } = require('./package.json');" : ""}

module.exports = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: ${isSubApp ? "'auto'" : "'/'"},
    ${isSubApp ? `
    library: \`\${name}-[name]\`,
    libraryTarget: 'umd',
    chunkLoadingGlobal: \`webpackJsonp_\${name}\`,
    ` : ''}
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript'
            ]
          }
        }
      },
      {
        test: /\\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  devServer: {
    port: ${isSubApp ? 5174 : 5173},
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};`;
  
  fs.writeFileSync(path.join(appDir, 'webpack.config.js'), webpackConfig);

  const vitePath = path.join(appDir, 'vite.config.ts');
  if (fs.existsSync(vitePath)) fs.unlinkSync(vitePath);
}

// 1. Migrate Main App
console.log('Migrating main-app...');
migrateApp(path.join(__dirname, 'main-app'), false);

// 2. Migrate Sub App
console.log('Migrating sub-app-demo...');
migrateApp(path.join(__dirname, 'sub-app-demo'), true);

// 3. Write Sub App main.tsx and public-path.js
console.log('Updating sub-app-demo entry points...');
fs.writeFileSync(path.join(__dirname, 'sub-app-demo/src/public-path.js'), `
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
`);

fs.writeFileSync(path.join(__dirname, 'sub-app-demo/src/main.tsx'), `
import './public-path';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

let root: any = null;

function render(props: any) {
  const { container, eventBus } = props;
  const target = container
    ? container.querySelector('#root') || container
    : document.querySelector('#root');
  
  root = createRoot(target);
  root.render(
    <App eventBus={eventBus} />
  );
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('[sub-app-demo] react app bootstraped');
}

export async function mount(props: any) {
  console.log('[sub-app-demo] props from main framework', props);
  render(props);
}

export async function unmount(props: any) {
  if (root) {
    root.unmount();
    root = null;
  }
}
`);

console.log('Done script');
