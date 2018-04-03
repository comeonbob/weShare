- Date :   2018-04-03
- Author : Bob

## 背景
随着项目的推移， 第三库使用数量增加，业务代码更是成倍增加，不知不觉发现webpack构建速度却越来越慢，从当初的30s，变成5分钟以上。 与此同时，一个同学的项目也遇到了打包慢的问题。 于是下定决心，花两周潜心研究下如何提升webpack构建性能。

## 初步成果
两周后，收获满满的。初步战果如下：
（1） 自己的项目： vue2(全家桶)+element-ui+axios+echarts+lodash+...  约120个页面
 dev：从90s+ 优化到  41s
 product: 从9分钟+ 优化到 43s
（2） 同学的项目： react + redux + antd + moment+ rc-table + ...  约40个页面
dev:  从2分钟+ 优化到 12s
product: 从9分钟+优化到 13s

## 总结优化方法
首先，优化思路是从webpack构建过程去分析，主要是解析和压缩优化。
#### 分析工具
(1)  **webpack-bundle-analyzer** 
可视化查看打包后的文件，以及文件包含的内容。
主要注意两点： 
1. 每个打包后文件的大小，其实业务代码chunk包一般在20k以内。如果大了，就可能是把第三方库打包进去了。
2.  打包后的文件是否有重复引用的库，应该提出来。
**举个栗子**：
*优化前*
![可视化打包文件](https://img-blog.csdn.net/2018040310240360?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JvYl9iYW9iYW8=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
从图中我们发现，打包后的文件中， 很多包含了node_modulles/echarts, zrender两个库。 此时，我们就可以用DllPlugin插件，把这两个第三方库提出来， 减少单个业务代码页面打包后的文件大小， 避免重复编译。

*优化后*
![这里写图片描述](https://img-blog.csdn.net/20180403102945389?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JvYl9iYW9iYW8=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
提取第三方库后，我们发现页面小了很多。 这时候又发现很多个文件都包含了公共代码src/utils/_serivce.js , 这种公共的业务代码也是常见的问题， 通常有以下几种办法

 -  按需加载  import { a } from xxx, 每个页面只引用需要的。需要配合export使用，修改源文件导出方式。
 -  公用方法挂载到根实例, 如vue中， Vue.prototype._utils = _utils 。 也需要修改源文件，且不宜过大。
 -  Tree Shaking  打包后，抖落掉不需要的代码， 不用修改源码。

（2）**webpack  - -profile**
可以查看打包过程中，每个步骤的速度。如果某个步骤卡了很长时间，就把对应关键字放到github上搜索， 可以发现一些很好的解决方法。
其中，同学的那个项目，打包过程中卡住在91% additional asset processing， 而且卡住了几分钟。 后来在github的webpack项目的issue中找到解决办法， 升级webpack版本至2.7, 以及把extract-text-webpack-plugin库升级至2.1.2。 居然一下快了几分钟~

---
另外， 把优化方法分成通用，开发，生产三类。
优先级从高到低，如下：

#### 通用优化
1.  **使用 DllPlugin**
原理是把第三方库文件分离出来单独编译，并且缓存; 极大的减少业务页面的编译时间， 以及编译后的文件大小。
优化时间： 3分钟+
详细： 
https://webpack.js.org/plugins/dll-plugin/ （官网）
https://www.cnblogs.com/ghost-xyx/p/6472578.html

2. **升级webpack和node**
（1）webpack最新版本为v4+， 官方称对比v3, 性能提升了60%。这次优化时，还是用v2.7， 因为升级v4失败了。
  优化时间： 待实践。
  详细： https://blog.csdn.net/qq_26733915/article/details/79446460
（2）升级node， node目前稳定版本为v8.9.4。保持最新版本能够保证编译性能，npm保持最新也能建立更高效的模块树以及提高解析速度。
   优化时间： 30s+
   详细： https://www.cnblogs.com/xinjie-just/p/7061619.html

3.  **多线程解析**
(1) happypack, 多线程解析文件，如babel-loader等耗时较长的。 
	还可以配合cache-loader使用。
	优化时间： 15s左右
	详细： https://github.com/amireh/happypack
	要求： webpack 2+
(2) thread-loader: 还没实践过，原理也是多线程解析。
	优化时间： 待实践
    详细： https://webpack.js.org/loaders/thread-loader/

4.  **缓存**
cache-loader
优化时间： 约5s
详细： https://webpack.js.org/loaders/cache-loader/
5.  **提取公共代码**
CommonsChunkPlugin
这次实践中使用了CommonsChunkPlugin，并没有什么明显效果， 然后就换成了DllPlugin。
也许，这两个项目都是单页应用，多页应用可能效果比较好。还是个疑惑的地方~
优化时间： 待实践
详细： https://webpack.js.org/plugins/commons-chunk-plugin/

6.  **其它**
（1） loaders应尽可能配置解析路径include参数，排除路径exclude参数， 减少解析时查询范围。
（2） Tree Shaking. 按需加载思想差不多，去掉多余的代码。
优化时间： 待实践。
详细： https://webpack.js.org/guides/tree-shaking/
（3） 第三库的选择， 尽量少用，或用精简的库替代；一些工具函数，最好用原生替代。

#### 开发环境优化
1.  在内存中编译 webpack-dev-middleware等
2.  devtool 设置成cheap-module-eval-source-map， 已经能满足调试需求， 编译能更快。
优化时间： 10s 左右

#### 生产环境优化
 1.  **多线程压缩**
库： webpack-parallel-uglify-plugin
顾名思义， 多线程压缩，配合缓存大大减少了压缩时间，替代了自带的UglifyJsPlugin
优化时间： 40s+
详细： 
```
// 多线程压缩插件
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

plugins: [
    new ParallelUglifyPlugin({
      cacheDir: '.cache/',
      uglifyJS:{
        output: {
          comments: false
        },
        compress: {
          dead_code: true,
          warnings: false,
          drop_debugger: true,
          drop_console: true
        }
      },
      sourceMap: false
    })
   ]
```

2.**多线程编译**
库： parallel-webpack
优化时间： 待实践
详细： https://github.com/trivago/parallel-webpack

3.**去掉source-map**
大多数情况，生产环境不需要详细源码。
优化时间： 10s+

## 分享优化过程
解决问题的思路有时候更重要
1.  很多技术官网是解决问题最快的方式， 如webpack构建优化[官网文章](https://webpack.js.org/guides/build-performance/)
2.  针对大部分第三方库的疑难杂症，在github上对应该库的issue，是最快解决问题的地方
3.  一时没有找到解决办法， 休息一下，下次也许就会有不一样的理解。

## 立个flag
- 尽快完成待实践的技术部分，出下一篇优化文章。
- 研究优化首页加载。

