/*
 * @Author: sloong
 * @Date:   2016-05-24
 */
'use strict';

let path = require('path');
let fs = require('fs')

let _ = require('lodash');
let webpack = require('webpack');
let glob = require('glob');

let ExtractTextPlugin = require('extract-text-webpack-plugin')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

let srcDir = path.resolve(process.cwd(), 'src');
let assets = path.resolve(process.cwd(), 'assets')
let nodeModPath = path.resolve(__dirname, './node_modules')
let pathMap = require('./src/pathmap.json');

let entries = (()=>{
    let jsDir = path.resolve(srcDir, 'js')
    let entryFiles = glob.sync(jsDir + '/*.{js,jsx}')
    let map = {}

    entryFiles.forEach((filePath) => {
        let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
        map[filename] = filePath
    })

    return map
})()

let chunks = Object.keys(entries);

module.exports = (options) =>{
    options = options || {};
    let debug = options.debug !== undefined ? options.debug :true;
    let publicPath = '/';
    let extractCSS
    let cssLoader
    let sassLoader
    // generate entry html files
    // 自动生成入口文件，入口js必须和入口文件名相同
    // 例如，pageA页面的入口文件为pageA.html，那么在js目录下就必须有一个pageA.js作为入口文件
    let plugins = (()=>{
        let entryHtml = glob.sync(srcDir + "/*.html")
        let r = []

        entryHtml.forEach((filePath) =>{
            let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf("."))
            let conf = {
                template:'html!'+filePath,
                filename:filename+'.html'
            }
            if(filename in entries){
                conf.inject = 'body'
                conf.chunk = ['vender','common',filename]
            }

            if(/b|c/.test(filename)) conf.chunk.splice(2,0,'common-b-c')

            r.push(new HtmlWebpackPlugin(conf))
        })

        return r;
    })()

    if(debug){
        extractCSS = new ExtractTextPlugin('css/[name].css?[contenthash]')
        cssLoader = new extractCSS.extract(['css'])
        sassLoader = extractCSS.extract(['css','sass'])
        plugins.push(extractCSS,new webpack.HotModuleReplacementPlugin())
    }else{
        extractCSS = new ExtractTextPlugin('css/[contenthash:8].[name].min.css', {
            // 当allChunks指定为false时，css loader必须指定怎么处理
            // additional chunk所依赖的css，即指定`ExtractTextPlugin.extract()`
            // 第一个参数`notExtractLoader`，一般是使用style-loader
            // @see https://github.com/webpack/extract-text-webpack-plugin
            allChunks: false
        })
        cssLoader = extractCSS.extract(['css?minimize'])
        sassLoader = extractCSS.extract(['css?minimize', 'sass'])

        plugins.push(
            extractCSS,
            new UglifyJsPlugin({
                compress:{
                    warnings:false
                },
                output:{
                    comments:false
                },
                mangle:{
                    except:['$','exports','require']
                }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.NoErrorsPlugin()
        )
    }

    let config = {
        entry:Object.assign(entries,{
            //用到的公共lib（例如zepto,avalon)，就把它加到vender去，目的是为了将公共库单独打包
            'vender':['zepto']
        }),

        output:{
            path:assets,
            filename:debug ? '[name].js' : 'js/[chunkhash:8].[name].min.js',
            chunkFilename: debug ? '[chunkhash:8].chunk.js' : 'js/[chunkhash:8].chunk.min.js',
            hotUpdateChunkFilename: debug ? '[id].js' : 'js/[id].[chunkhash:8].min.js',
            publicPath:publicPath
        },

        resolve:{
            root:[srcDir,nodeModPath],
            alias:pathMap,
            extensions:['','.js','.css','.scss','.tpl','.png','.jpg']
        },

        module:{
            loaders:[
                {
                    test: /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/,
                    loaders: [
                        // url-loader更好用，小于10KB的图片会自动转成dataUrl，
                        // 否则则调用file-loader，参数直接传入
                        'url?limit=10000&name=img/[hash:8].[name].[ext]',
                        'image?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:"65-80",speed:4}}'
                    ]
                },
                {
                    test: /\.((ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9]))|(ttf|eot)$/,
                    loader: 'url?limit=10000&name=fonts/[hash:8].[name].[ext]'
                },
                {test: /\.(tpl|ejs)$/, loader: 'ejs'},
                {test: /\.css$/, loader: cssLoader},
                {test: /\.scss$/, loader: sassLoader},
                {test: /\.jsx?$/, loader: 'babel?presets[]=react,presets[]=es2015'}
            ]
        },

        plugins:[
            //new webpack.BannerPlugin('built by sloong'),
            //提供全局的变量，在模块中使用无需用require引入
            /*new webpack.ProvidePlugin({
                jQuery: "jquery",
                $: "jquery",
                avalon: "avalon"
                // nie: "nie"
            }),*/
            new CommonsChunkPlugin({
                name: 'common-b-c',
                chunks: ['b', 'c']
            }),
            new CommonsChunkPlugin({
                name: 'common',
                chunks: ['common-b-c', 'a']
            }),
            new CommonsChunkPlugin({
                name: 'vender',
                chunks: ['common']
            })
        ].concat(plugins),

        devtool : debug?'eval-source-map':null ,

        devServer:{
            hot:true,
            noInfo:false,
            inline:true,
            publicPath:publicPath,
            stats:{
                cached:false,
                colors:true
            }
        }
    }

    if(debug){
       // 为了实现webpack-hot-middleware 做相关配置
        //@see https://github.com/glenjamin/webpack-hot-middleware
        ((entry) =>{
            for(let key of Object.keys(entry)){
                if(!Array.isArray(entry[key])){
                    entry[key] = Array.of(entry[key])
                }
                entry[key].push('webpack-hot-middleware/client?reload=true')
            }
        })(config.entry)

        config.plugins.push( new webpack.HotModuleReplacementPlugin() )
        config.plugins.push( new webpack.NoErrorsPlugin() )
    }

    return config

}