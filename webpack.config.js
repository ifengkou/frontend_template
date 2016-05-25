var webpack = require('webpack');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;


var srcDir="src/";
var distDir = "dist/";
module.exports = {
    //https://segmentfault.com/a/1190000004280859
    //Ĭ��Ϊ��cheap-module-source-map ����������Ϣ
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
            //.scss �ļ�ʹ�� style-loader��css-loader �� sass-loader �����봦��
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            //ͼƬ�ļ�ʹ�� url-loader ������С��8kb��ͼƬֱ��תΪbase64,����תΪdata url��ʽ
            //{ test: /\.(png|jpg)$/, loader: 'url?limit=8192'}
        ]
    },
    resolve: {
        //���ñ���������Ŀ�п���������·��
        alias: {
            jquery: srcDir + "/js/lib/jquery.min.js",
            core: srcDir + "/js/core",
            ui: srcDir + "/js/ui"
        }
    },
    plugins: [
        //�ṩȫ�ֵı�������ģ����ʹ��������require����
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
            // nie: "nie"
        }),
        //�����������������ϲ�Ϊһ���ļ�
        new webpack.optimize.CommonsChunkPlugin('common.js'),
        //js�ļ���ѹ��
        new uglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
}