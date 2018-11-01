---
title: Javascript单元测试及接口测试
categories: Bob
tags: JS
date: "2018-09-30"
---
**文章概要**

 - 什么是单元测试
 - 为什么要做单元测试
 - javascript测试框架对比
 - koa2中如何使用AVA做单元测试
 - vue2中如何使用AVA做单元测试
 - koa2中如何使用AVA做接口测试

### 单元测试是什么

单元测试（unit testing）指的是以软件的单元（unit）为单位，对软件进行测试。单元可以是一个函数，也可以是一个模块或组件。它的基本特征就是，只要输入不变，必定返回同样的输出。

单元测试应该避免依赖性问题，比如不存取数据库、不访问网络等等，而是使用工具虚拟出运行环境。这种虚拟使得测试成本最小化，不用花大力气搭建各种测试环境。

一般来说，单元测试的步骤如下。

 1. 准备所有的测试条件
 2. 调用（触发）所要测试的函数
 3. 验证运行结果是否正确
 4. 还原被修改的记录


### 为什么要做单元测试

Web应用程序越来越复杂，这意味着有更多的可能出错。测试是帮助我们提高代码质量、降低错误的最好方法和工具之一。

 - 测试可以确保得到预期结果
 - 加快开发速度
 - 方便维护
 - 提供用法的文档

通过测试提供软件的质量，在开始的时候，可能会降低开发速度。但是从长期看，尤其是那种代码需要长期维护、不断开发的情况，测试会大大加快开发速度，减轻维护难度。

### javascript测试框架对比
- [Mocha](https://github.com/mochajs/mocha)
Star: 16.3k
使用最多，社区成熟，需要较多配置

- [Jasmine](https://github.com/jasmine/jasmine)
Star: 13.9k
开箱即用(支持断言和仿真)，全局环境，比较‘老’，坑基本都有人踩过

- [Tape](https://github.com/substack/tape)
Star: 4.8k
体积最小，只提供最关键的东西

- [Jest](https://github.com/facebook/jest)
Star: 20.7k
facebook 坐庄，开箱即用配置少，API简单；较新，社区不十分成熟

- [AVA](https://github.com/avajs/ava)
Star: 14.8k
异步，性能好；简约，清晰；快照测试和断言需要三方支持

总结一下，Mocha 用的人最多，社区最成熟，灵活，可配置性强易拓展，Jest 开箱即用，里边啥都有提供全面的方案，Tape 最精简，提供最基础的东西最底层的API。而我们选择了AVA， 支持异步，性能好，也有较多的人使用。

### koa2中如何使用AVA做单元测试
**一、简单3步骤**
 1. 安装AVA
	```bash
	npm install --global ava
	ava --init
	```
 2. 创建测试文件
在项目工程目录下创建test文件夹，在该文件夹下创建test.js文件
	```javascript
	import test from 'ava';
	test('foo', t => {
   	 	t.pass();
	});
	test('bar', async t => {
    	const bar = Promise.resolve('bar');
	    t.is(await bar, 'bar');
	});
	```
 3. 运行
	` npm run test --verbose --watch`
	其中 --verbose表示详细输出； --watch其中观察模式

二、实际项目需要注意事项

 1. package json中可以配置单元测试命令
	```javascript
	"scripts": {
    	"test": "ava --verbose",  // 单次运行
    	"wtest": "ava --verbose --watch"  // 监听运行
  	}
	```
 2. 目录结构
源码目录与测试目录一一对应，如下：
 - src
   * service
      + tools.js
  - test
    * service
      + tools.test.js
   
   
 3. 单元测试示例
	```javascript
	/**
	* @Desc:   工具函数单元测试
	* @Author: Bob
	* @Date:   2018-09-12
	*/
	import test from 'ava'
	import tools from '../../service/tools'
	/** 获取指定位数的随机数字符串 */
	test('getRandom', t => {
		// 自然数
		let result = tools.getRandom(6);
		t.is(result.length, 6);

		// 1000位
		result = tools.getRandom(1000);
		t.is(result.length, 1000);

		// 小数
		result = tools.getRandom(6.8);
		t.is(result.length, 6);

		// 负数
		result = tools.getRandom(-6.8);
		t.is(result.length, 0);

		// 字符串
		result = tools.getRandom('abc');
		t.is(result.length, 0);

		// null
		result = tools.getRandom(null);
		t.is(result.length, 0);

		// undefined
		result = tools.getRandom(undefined);
		t.is(result.length, 0);
	});
	```

 4. 测试方法
 - 结果是否正确 
 - 是否所有的边界条件都是正确的
 - 检查反向关联 
 - 强制产生错误条件
 - 性能特性

5. 测试API
AVA 提供的API比较简洁，清晰，详见[官方文档](https://github.com/avajs/ava-docs/blob/master/zh_CN/readme.md)

### vue2中如何使用AVA做单元测试

前端使用AVA做单元测试操作步骤同上，编译时可能会遇到几个错误。
-  es6 语法不支持，import等关键词不支持
- 有包含css文件编译报错
- 有包含@相对路径报错

解决方法：
前面两项可以通过在package.json 中增加配置文件，并且要把babel配置中module: false 去掉, 这个bug 花了很多时间才解决，github上有[issue](https://github.com/avajs/ava/issues/1640)。
```javascript
  "ava": {
    "files": [
      "test/**/**.test.js"
    ],
    "babel": "inherit",
    "require": [
      "babel-core/register",
      "babel-polyfill",
      "ignore-styles"
    ]
  }
```
第三个可能问题， 需要修改下测试文件，把@相对路径，修改成../../这种模式即可。

另外， 前端只做了公共函数的单元测试， 接口测试放在后端做，单文件组件测试ava没有很好的支持。

### koa2中如何使用AVA做接口测试

- 接口测试，指的是对koa2 中routes的api服务测试，每个接口对应一个测试用例。
- 接口测试，能够保持api的服务稳定， 便于后续代码维护，减少耦合问题。
- 接口测试，使用mock数据发送请求，调用正常服务，测试完需要还原数据。
- 接口测试，与业务逻辑关联，构造mock数据，构造cookie，请求执行顺序是几个难点。
- supertest可以很好的在koa2中支持接口测试。

**接口测试示例**
- 在前面单元测试的基础上，安装supertest
`npm install supertest --save-dev`

- 创建接口测试文件， test/routes/api.test.js
	```javascript 
	/**
	 * @Desc:   路由单元测试
	 * @Author: Bob
	 * @Date:   2018-09-12
	 */
	import test from 'ava'
	import request from 'supertest'
	import app from '../../app.js'
	
    // 测试接口
    test.cb(`GET v1/demo/status`, async t => {
		request(app)
		.get(`v1/demo/status`)
		.expect('Content-Type', /json/)
		.end((err, res) => {
			if (err)  console.log(err);
			t.is(typeof res.body, 'object');
			t.is(res.body.code, 0);
			t.end();
		});
	});

	```
- app.js 中需要导出服务句柄， 很容易配合supertest使用
	```javascript
	const Koa = require('koa');
	const app = new Koa();
	const koaBody = require('koa-body');
	const cors = require('@koa/cors');
	const config = require('./config/base');
	const router = require('./routes/index');
	
	// 跨域
	app.use(cors( config.corsOption ));
	
	app.use(koaBody());
	app.use(router.routes());
	app.use(router.allowedMethods());
	
	let server = app.listen(config.port, () => {
	  console.log(`app is listening on ${config.port}`);
	});
	
	module.exports = server;
	```
- 接口源文件./routes/index
	```javascript
	const Router = require('koa-router');
	const router = new Router();
	/** 测试接口 */
	router.get('/v1/demo/status', async (ctx, next) => {
		let rst = await getData();
		ctx.response.body = { code:  0, data: rst };
	});

	module.exports = router;
	```

- 若有些接口需要cookie, 可以放在前置钩子函数中; 数据还原，放在后置钩子函数中
	```javascript
	/** 测试前置钩子函数, 初始化cookie等 */
	test.before('before', async t => {
	   await login();
	   setCookie();
	});

	/** 测试后置钩子函数, 数据还原等 */
	test.after('after', async t => {
		await removeSome();
	});
	```
- 接口性能测试，模拟同时发送1000个请求，可以查看耗时，数据库连接性能等问题。
	```javascript
	test('GET /v1/demo/company',  async t => {
		let count = 1000;
		let statrt_time = new Date().getTime();
		let pAll = [];
		for (let i = 0; i < count; i++) {
			pAll.push(request(app).get('v1/demo/company'));
		}
		let result = await Promise.all(pAll);
		let end_time = new Date().getTime();
		console.log(`response time: ${end_time - start_time}ms`);
		t.is(data.length, count);
	});
	```


**参考文章**
- [JavaScript 程序测试 阮一峰](http://javascript.ruanyifeng.com/tool/testing.html)
- [JavaScript 测试框架对比](https://www.colabug.com/2659042.html)
- [前端测试框架对比](https://www.cnblogs.com/lihuanqing/p/8533552.html)