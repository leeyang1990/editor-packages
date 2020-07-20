const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    // mode: 'development',
    //入口文件的路径
    entry: "./test/test.tsx",
    // 添加需要解析的文件格式
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    plugins: [
        new HtmlWebpackPlugin({ filename: "index.html", template: "./test/index.html", title: "hierarchy-tree", inject: true }),

    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader'],
                exclude: /node_modules/,
            },
            { test: /\.less?$/, loader: "style-loader!css-loader!less-loader" }
        ]
    },
    output: {
        //打包的输出路径
        path: path.resolve(__dirname, 'dist/test/'),
        filename: 'index.js',
    },
    externals: {
        // 'react': 'react',
        // 'react-dom': 'react-dom'
    }
}