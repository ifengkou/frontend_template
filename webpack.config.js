var webpack = require('webpack');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;


var srcDir="src/";
var distDir = "dist/";
module.exports = {
    //https://segmentfault.com/a/1190000004280859
    //默认为：cheap-module-source-map 不包含列信息
    devtool: "source-map",
    entry: './entry.js',
    output: {
        path: path.join(__dirname, distDir),
        publicPath:distDir,
        filename: '[name].js'
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: 'style!css'},
            //{ test: /\.js$/, loader: 'jsx?harmony' },
            //.scss 文件使用 style-loader、css-loader 和 sass-loader 来编译处理
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            //图片文件使用 url-loader 来处理，小于8kb的图片直接转为base64,否则转为data url形式
            //{ test: /\.(png|jpg)$/, loader: 'url?limit=8192'}
        ]
    },
    resolve: {
        //配置别名，在项目中可缩减引用路径
        alias: {
            jquery: srcDir + "/js/lib/jquery.min.js",
            core: srcDir + "/js/core",
            ui: srcDir + "/js/ui"
        }
    },
    plugins: [
        //提供全局的变量，在模块中使用无需用require引入
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
            // nie: "nie"
        }),
        //将公共代码抽离出来合并为一个文件
        new webpack.optimize.CommonsChunkPlugin('common.js'),
        //js文件的压缩
        new uglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
}