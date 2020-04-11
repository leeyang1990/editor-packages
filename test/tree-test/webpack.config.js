const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const packageVersion = require('./package.json').version;
const path = require("path");
module.exports={
    entry: {
        app: ['./index.tsx'],
    },
    output: {
        filename: 'bundle.[hash].js',
        path: path.join(__dirname, '/dist'),
        chunkFilename: '[name].[hash].js'
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        // 配置相应的规则
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader','css-loader']
            },
            {
                test: /\.ts[x]?$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js[x]?$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    // 配置相应的插件
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        // 启用 HMR
        new webpack.HotModuleReplacementPlugin(),
        // 在控制台中输出可读的模块名
        new webpack.NamedModulesPlugin(),
        // 不做改动hash保持不变
        new webpack.HashedModuleIdsPlugin(),
        new webpack.DefinePlugin({
            __VERSION__: JSON.stringify(packageVersion)
        })
    ],
    performance: {
        // false | "error" | "warning" // 不显示性能提示 | 以错误形式提示 | 以警告...
        hints: "warning",
        // 开发环境设置较大防止警告
        // 根据入口起点的最大体积，控制webpack何时生成性能提示,整数类型,以字节为单位
        maxEntrypointSize: 50000000,
        // // 最大单个资源体积，默认250000 (bytes)
        maxAssetSize: 30000000
    },
    // 设置为开发模式
    mode: 'development',
    devtool: 'inline-source-map',
    // 配置服务端目录和端口
    devServer: {
        contentBase: './dist',
        port: 8080,
        openPage: '/',
        hot: true
    }
}