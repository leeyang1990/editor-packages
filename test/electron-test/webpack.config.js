const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const packageVersion = require('./package.json').version;
const path = require("path");
let getConfig=env=>{
    let main ={
        output: {
            path: path.join(__dirname, "dist"),
            filename: '[name].js',
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
        performance: {
            hints: "warning",
            maxEntrypointSize: 50000000,
            maxAssetSize: 30000000
        },
        mode: 'development',
    }

    return main;

}

module.exports = env => {
    let main = getConfig();
    main.target = "electron-main";
    main.entry = {
        'main': './main',
    };
    let renderer = getConfig();
    renderer.target = "electron-renderer";
    renderer.entry = {
        'app': './src/index.tsx'
    };
    renderer.plugins=[
        // new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.DefinePlugin({
            __VERSION__: JSON.stringify(packageVersion)
        })
    ]
    return [main,renderer];
}
