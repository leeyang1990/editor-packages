const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require("webpack");
const baseConfig = env => {
    const config = {
        devtool: false,
        module: {
            rules: [
                {
                    test: /\.tsx?$/, loader: "ts-loader", options: {
                        transpileOnly: true
                    }
                },
                { test: /\.css?$/, loader: "style-loader!css-loader" },
                {
                    test: /\.(eot|woff|ttf|png|gif|svg|otf)([\?]?.*)$/,
                    loader: 'file-loader?name=[path][name].[ext]'
                }
            ]
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
            alias: {
                "@src": path.resolve('src'),
                "@components": path.resolve('src/components'),
            }
        },
        externals: {
        },

    }
    return config;
}
const main = {
    ...baseConfig(),
    entry: { 'main': './main/main' },
    target: 'electron-main',
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: process.env.NODE_ENV=="production",
        })
    ]

}
const render = {
    ...baseConfig(),
    entry: { 'app': './src/index' },
    target: 'electron-renderer',
    output: {
        path: path.resolve(__dirname, 'dist/app/'),
        filename: '[name].js',
    },
    plugins: [
        new HtmlWebpackPlugin({ filename: "app.html", template: "index.html",title: "Weewok" }),
        new ForkTsCheckerWebpackPlugin(),
        new webpack.ProvidePlugin({}),
        new webpack.DefinePlugin({
            PRODUCTION: process.env.NODE_ENV=="production",
        })
    ]
}

module.exports = env => {
    return [main, render];
}

