const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: '/',
    
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
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
        test: /\.css$/i,
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
    port: 5173,
    static: [
      {
        directory: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        watch: true,
      },
      {
        directory: path.resolve(__dirname, '../sub-app-demo/dist'),
        publicPath: '/sub-app-demo/',
        watch: true,
      },
    ],
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    client: {
      overlay: false,
    },
  },
};
