---
title: Node开发脚手架工具
categories: Bob
tags: Node
date: "2018-06-27"
---


### 引言
曾经接触过vue-cli脚手架，发现真的很神奇，能够短短几分钟，构建出一个vue框架的初始项目。今天， 就来揭开脚手架神秘的面纱， 自己也可以编写脚手架，提高工作效率。

### 脚手架使用流程
回忆一下vue-cli脚手架， 我们使用的流程：

- 全局安装vue-cli： `npm install -g vue-cli`
- 初始化项目： `vue create my-project`
- 根据提示选择： 一般都是选择默认配置
- 终端不同颜色提示，图标
- 给出运行样例，即可运行

### 如何实现
清楚了脚手架的功能之后， 就可以一步一步分析如何实现它。
解析一个demo： [h5-clis](https://github.com/comeonbob/h5-cli)
（1）**全局安装， 简单命令创建项目功能**
实现原理： package.json 中有bin 选项配置，如：
```javascript
{
  "bin": {
    "h5-cli": "./index"
  }
}
```
全局安装后，在终端运行命令： `h5-cli init`， 相当于运行了全局依赖包中的index文件， index文件中标明是node运行。
```
#!/usr/bin/env node
require('./lib/init');
```
（2） **初始化项目功能**
实现原理： 终端接收用户输入的指令， 执行特定初始化操作，包括获取框架模板template, 在本地生成初始项目。
依赖包如下：

- commander.js，可以自动的解析命令和参数，用于处理用户输入的命令。
- download-git-repo，下载并提取 git 仓库，用于下载项目模板。
- fs-extra，文件系统fs扩展, 支持promise异步

主要实现代码：
```javascript
// resolve commands and params
const program = require('commander');
const file = require('./file');
/**
 * Usage.
 */
  program
  .usage('init [h5-template]')
  .version('1.6.0', '-v, --version')
  .command('init <name>')
  .action(name => {
    main(name);
  });

/**
 * main
 */
function main(name) {
  file.generate(name);
}

program.parse(process.argv);
```
[详见源码](https://github.com/comeonbob/h5-cli)
lib
: download.js  //下载模板
: file.js  //拷贝模板
: init.js //初始化项目

（3） **终端提示，用户交互**
若是比较灵活的脚手架，在终端与用户有交互，根据不同选择，生成不同模板。
实现原理：

- Inquirer.js，通用的命令行用户界面集合，用于和用户进行交互。
- handlebars.js，模板引擎，将用户提交的信息动态填充到文件中。
h5-clis 脚手尽量精简，使用了默认值。

（4） **终端不同颜色提示，图标**
实现原理：

- ora，下载过程久的话，可以用于显示下载中的动画效果。
- chalk，可以给终端的字体加上颜色
```javascript
const ora = require('ora');
const spinner = ora('generate project start');
spinner.start('download ...');
await download.download(projectName);
spinner.succeed('download template success');
```
为了给用户更好的体验，建议加上下载中动画，字体颜色提示，图标等。

（5）**给出运行样例，即可运行**
实现原理：
运行示例， 帮助信息，版本信息等。都可以通过log打出：
```javascript
/**
 * Help.
 */
program.on('--help', () => {
  console.log()
  console.log('  Examples:')
  console.log()
  console.log(chalk.green('    # create a new project with an local template: init <h5-tempalte>'))
  console.log('    $ h5-cli init koa2')
  console.log()
  console.log(chalk.green('    # create a new project from a github template: init <username/repo>'))
  console.log(chalk.white('    $ h5-cli init comeonbob/h5-template-koa2'))
  console.log()
})
```

### 运行脚手架

- 全局安装
```
npm install -g h5-clis 
```
- 初始化项目
```
h5-cli init koa2
```
效果图：
![初始化项目](/img/cli_npm.png)
- koa2-project 项目生成，切换目录，安装依赖包，即可查看demo
```
cd koa2-project
npm install
node app.js
```
效果图：
![运行demo](/img/cli_api.png)

### 脚手架利弊
> 脚手架可以减少重复性的工作，开启一个新项目时候，不必重头开始，也不需要再旧的项目上删减，减少不必要的文件拷贝，可以大大提高工作效率；然而便利的同时，也容易忽略项目的本来面貌，技术的实现原理。 建议使用脚手架前，耐心了解生成模板框架 源码， 阅读其官网文档，从而知其然，也能知其所以然。

安利两个脚手架, 支持npm直接安装：
- [simple-koa2-cli](https://github.com/comeonbob/simple-koa2-cli) node层简单的koa2模板脚手架
- [h5-clis](https://github.com/comeonbob/h5-cli) h5脚手架，一键生成流行的框架模板. 如 vue2, koa2等。


---
- Date :   2018-06-27
- Author : Bob
