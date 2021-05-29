const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
module.exports = env => {
  return {
    entry: "./src/index.ts",
    devtool: false,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {}
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
      alias: {}
    },
    externals: {},
    plugins: [
      new HtmlWebpackPlugin({ filename: "index.html", template: "index.html", title: "lit-website" }),
      new ForkTsCheckerWebpackPlugin(),
      new webpack.SourceMapDevToolPlugin({})
    ],
    // devServer: {
    //   contentBase: path.join(__dirname, 'dist'),
    //   compress: true,
    //   port: 9001,
    //   host: 'http://localhost'
    // },
  };
};