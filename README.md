# front_end 项目模板 #
前端目录模板。计划分支版本有:angularjs（SPA),avalon,常规web 应用项目(jquery+bootstrap)

方便快速搭建前端项目。项目分支主要有angularjs,avalon,web 应用项目

### 安装软件

- Node.js：v5.0+

- compass（非必须）：v1.0+

### 拷贝项目模板

``` bash
$ git clone https://github.com/ifengkou/frontend_template.git
```


### 安装依赖模块

``` bash
$ npm install -g gulp webpack
$ npm install -g node-dev # 推荐这个工具，代码改动会自动重启node进程
$ cd frontend_template && npm install
```

### 业务开发

#### 目录结构

``` js
.
├── config.rb                 # compass配置
├── gulpfile.js               # gulp任务配置
├── mock/                     # 假数据文件
├── package.json              # 项目配置
├── README.md                 # 项目说明
├── src                       # 源码目录
│   ├── pageA.html                # 入口文件a
│   ├── pageB.html                # 入口文件b
│   ├── pageC.html                # 入口文件c
│   ├── css/                  # css资源
│   ├── img/                  # 图片资源
│   ├── js                    # js&jsx资源
│   │   ├── pageA.js              # a页面入口
│   │   ├── pageB.js              # b页面入口
│   │   ├── pageC.js              # c页面入口
│   │   ├── components/       # 组件
│   │   ├── helpers/          # 业务相关的辅助工具
│   │   ├── lib/              # 没有存放在npm的第三方库或者下载存放到本地的基础库，如jQuery、Zepto、React等
│   │   └── utils/            # 业务无关的辅助工具
│   ├── scss/                 # scss资源
│   ├── pathmap.json          # 手动配置某些模块的路径，可以加快webpack的编译速度
├── make-webpack.config.js    # webpack配置
├── webpack.config.js         # 正式环境webpack配置入口
└── webpack-dev.config.js     # 开发环境webpack配置入口
```

##### 单/多页面支持

约定`/src/*.html`为应用的入口文件，在`/src/js/`一级目录下有一个同名的js文件作为该入口文件的逻辑入口（即entry）。

在编译时会扫描入口html文件并且根据webpack配置项解决entry的路径依赖，同时还会对html文件进行压缩、字符替换等处理。

这样可以做到同时支持SPA和多页面型的项目。

### 编译

``` bash
$ npm run build
```

### 部署&发布

纯静态页面型的应用，最简单的做法是直接把`assets`文件夹部署到指定机器即可（先配置好机器ip、密码、上传路径等信息）：

``` js
$ npm run deploy # or run `gulp deploy`
```

如果需要将生成的js、css、图片等发布到cdn，修改下`publicPath`项为目标cdn地址即可：

``` js
...
output: {
  ...
  publicPath: debug ? '' : 'http://cdn.site.com/'
}
...
```