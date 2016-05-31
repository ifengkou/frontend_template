/*
 * @Author:sloong
 * @Date: 2016-05-27
 */

'use strict';

let path = require('path')
let fs = require('fs')

let webpack = require('webpack')
let _ = require('lodash')
let glob = require('glob')

let ExtractTextPlugin = require('extract-text-webpack-plugin')
let HtmlWebpackPlugin = require('html-webpack-plugin')

let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin

let srcDir = path.resolve(process.cwd(), 'src')
let assets = path.resolve(process.cwd(), 'assets')
let nodeModPath = path.resolve(__dirname, './node_modules')
let pathMap = require('./src/pathmap.json')

let entries = (() => {
    let jsDir = path.resolve(srcDir, 'js')
    let entryFiles = glob.sync(jsDir + '/*.{js,jsx}')
    let map = {}

    entryFiles.forEach((filePath) => {
        let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
        map[filename] = filePath
    })

    return map
})()
let chunks = Object.keys(entries)

module.exports = (options) => {
    options = options || {}

    let debug = options.debug !== undefined ? options.debug : true
    // ����publicPathҪʹ�þ���·������Ȼscss/css�������ɵ�cssͼƬ����·���Ǵ���ģ�Ӧ����scss-loader��bug
    let publicPath = '/'
    let extractCSS
    let cssLoader
    let sassLoader

    // generate entry html files
    // �Զ���������ļ������js�����������ļ�����ͬ
    // ���磬aҳ������ļ���a.html����ô��jsĿ¼�±�����һ��a.js��Ϊ����ļ�
    let plugins = (() => {
        let entryHtml = glob.sync(srcDir + '/*.html')
        let r = []

        entryHtml.forEach((filePath) => {
            let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
            let conf = {
                template: 'html!' + filePath,
                filename: filename + '.html'
            }

            if (filename in entries) {
                conf.inject = 'body'
                conf.chunks = ['vender', 'common', filename]
            }

            if (/b|c/.test(filename)) conf.chunks.splice(2, 0, 'common-b-c')

            r.push(new HtmlWebpackPlugin(conf))
        })

        return r
    })()

    // û����������Ҳ����ص�runtime�����û��װ��Щģ��ᵼ�±����е��
    /*plugins.push(
        new webpack.ProvidePlugin({
            _: 'lodash',
            $: 'zepto',
            avalon:'avalon'
        })
    )*/

    if (debug) {
        extractCSS = new ExtractTextPlugin('css/[name].css?[contenthash]')
        cssLoader = extractCSS.extract(['css'])
        sassLoader = extractCSS.extract(['css', 'sass'])
        plugins.push(extractCSS)
    } else {
        extractCSS = new ExtractTextPlugin('css/[contenthash:8].[name].min.css', {
            // ��allChunksָ��Ϊfalseʱ��css loader����ָ����ô����
            // additional chunk��������css����ָ��`ExtractTextPlugin.extract()`
            // ��һ������`notExtractLoader`��һ����ʹ��style-loader
            // @see https://github.com/webpack/extract-text-webpack-plugin
            allChunks: false
        })
        cssLoader = extractCSS.extract(['css?minimize'])
        sassLoader = extractCSS.extract(['css?minimize', 'sass'])

        plugins.push(
            extractCSS,
            new UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                output: {
                    comments: false
                },
                mangle: {
                    except: ['$', 'exports', 'require','avalon']
                }
            }),
            // new AssetsPlugin({
            //     filename: path.resolve(assets, 'source-map.json')
            // }),
            new webpack.optimize.DedupePlugin(),
            new webpack.NoErrorsPlugin()
        )

        plugins.push(new UglifyJsPlugin())
    }

    let config = {
        devtool: false,

        entry: Object.assign(entries, {
            // �õ�ʲô����lib������React.js�����Ͱ����ӽ�venderȥ��Ŀ���ǽ����ÿⵥ����ȡ���
            'vender': ['zepto', 'avalon']
        }),

        output: {
            path: assets,
            filename: debug ? '[name].js' : 'js/[chunkhash:8].[name].min.js',
            chunkFilename: debug ? '[chunkhash:8].chunk.js' : 'js/[chunkhash:8].chunk.min.js',
            hotUpdateChunkFilename: debug ? '[id].js' : 'js/[id].[chunkhash:8].min.js',
            publicPath: publicPath
        },

        resolve: {
            root: [srcDir, nodeModPath],
            alias: pathMap,
            extensions: ['', '.js', '.css', '.scss', '.tpl', '.png', '.jpg']
        },

        module: {
            loaders: [
                {
                    test: /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/,
                    loaders: [
                        // url-loader�����ã�С��10KB��ͼƬ���Զ�ת��dataUrl��
                        // ���������file-loader������ֱ�Ӵ���
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

        plugins: [
            new CommonsChunkPlugin({
                name: 'common-b-c',
                chunks: ['pageB', 'pageC']
            }),
            new CommonsChunkPlugin({
                name: 'common',
                chunks: ['common-b-c', 'pageA']
            }),
            new CommonsChunkPlugin({
                name: 'vender',
                chunks: ['common']
            })
        ].concat(plugins),

        devServer: {
            hot: true,
            noInfo: false,
            inline: true,
            publicPath: publicPath,
            stats: {
                cached: false,
                colors: true
            }
        }
    }

    if (debug) {
        // Ϊʵ��webpack-hot-middleware���������
        // @see https://github.com/glenjamin/webpack-hot-middleware
        ((entry) => {
            for (let key of Object.keys(entry)) {
                if (!Array.isArray(entry[key])) {
                    entry[key] = Array.of(entry[key])
                }
                entry[key].push('webpack-hot-middleware/client?reload=true')
            }
        })(config.entry)

        //config.plugins.push(new webpack.HotModuleReplacementPlugin())
        //config.plugins.push(new webpack.NoErrorsPlugin())
    }

    return config
}
