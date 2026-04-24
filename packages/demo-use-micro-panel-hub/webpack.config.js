const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (_env, argv = {}) => {
  const isProduction = argv.mode === "production";
  const libraryRoot = path.resolve(__dirname, "../micro-panel-hub");
  const librarySourceRoot = path.resolve(libraryRoot, "main-app/src");

  return {
    entry: "./src/main.tsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[contenthash].js",
      clean: true,
      publicPath: "auto",
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      alias: isProduction
        ? {}
        : {
            "@shupeixuan/micro-panel-hub$": path.resolve(librarySourceRoot, "lib.tsx"),
            "@shupeixuan/micro-panel-hub/styles.css$": path.resolve(
              librarySourceRoot,
              "styles.css",
            ),
          },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-env",
                ["@babel/preset-react", { runtime: "automatic" }],
                "@babel/preset-typescript",
              ],
            },
          },
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.html",
      }),
    ],
    devServer: {
      port: 5188,
      static: [
        {
          directory: path.resolve(__dirname, "public"),
          publicPath: "/",
          watch: true,
        },
        {
          directory: path.resolve(libraryRoot, "dist/sub-app-demo"),
          publicPath: "/sub-app-demo/",
          watch: true,
        },
      ],
      historyApiFallback: true,
    },
  };
};
