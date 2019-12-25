---
title: koa2源码解析（一）
categories: Bob
tags: Node
date: "2019-02-28"
---

## 一、koa2是什么
1.1 定义
> Koa 是一个新的 web 框架，由 Express 幕后的原班人马打造， 致力于成为 web 应用和 API 开发领域中的一个更小、更富有表现力、更健壮的基石。 通过利用 async 函数，Koa 帮你丢弃回调函数，并有力地增强错误处理。 Koa 并没有捆绑任何中间件， 而是提供了一套优雅的方法，帮助您快速而愉快地编写服务端应用程序。-- koa 官网

其中koa2是koa的v2.x版本，与v1.x对比，主要是替代了generator/yield的语法，使用es7 的 async/await更加优雅地实现异步。

1.2 为什么要用koa2
- github欢迎度高，是比较新的HTTP中间件框架
- 文档齐全，入门相对容易
- 异步处理很舒服，使用es7 async/await
-  社区活跃，容易解决问题

1.3 怎么用koa2
- 入门参考阮一峰的教程： [http://www.ruanyifeng.com/blog/2017/08/koa.html](http://www.ruanyifeng.com/blog/2017/08/koa.html)
- 查看语法细节，参考官网文档： [https://koa.bootcss.com](https://koa.bootcss.com)
- 查找疑难杂症，参考github issue： [https://github.com/koajs/koa/issues](https://github.com/koajs/koa/issues)
- 基础学习案例，参考学习笔记：[https://github.com/chenshenhai/koa2-note](https://github.com/chenshenhai/koa2-note)
- koa设计模式，参考学习笔记：[https://github.com/chenshenhai/koajs-design-note](https://github.com/chenshenhai/koajs-design-note)

## 二、koa2源码实现细节
koa2源码内只有四个文件，`application.js` 导出koa2类，继承事件类`Emitter`，主要做了这几件事：
（1）`listen()`调用node 原生http模块，创建服务；`callback()`响应中间件。
（2）`use()`方法实现中间件的加载
（3）`createContext()` 创建上下文对象
（4）`respond()` 响应请求体的处理

2.1 起服务
```javascript
  /**
   * Shorthand for:
   *
   *    http.createServer(app.callback()).listen(...)
   *
   * @param {Mixed} ...
   * @return {Server}
   * @api public
   */

  listen() {
    debug('listen');
    const server = this.server || http.createServer(this.callback());
    return server.listen.apply(server, arguments);
  }
```
首先，通过http模块http.createServer创建服务，并且添加了回调callback；然后通过apply方法，执行自定义回调参数arguments,并且返回一个服务句柄。

`callback()源码`
```javascript
  /**
   * Return a request handler callback
   * for node's native http server.
   *
   * @return {Function}
   * @api public
   */

  callback() {
    const fn = compose(this.middleware);  // 整合中间件函数，形成后续会详细介绍的洋葱模式

    if (!this.listeners('error').length) this.on('error', this.onerror);  // 错误处理

    return (req, res) => {  // 返回一个闭包
      res.statusCode = 404;  // 默认响应状态为404
      const ctx = this.createContext(req, res);  // 创建上下文对象
      const onerror = err => ctx.onerror(err);
      onFinished(res, onerror);  // 第三方库，响应结束
      fn(ctx).then(() => respond(ctx)).catch(onerror);  // 传入上下文对象，开始执行中间件函数；全部执行完后，执行响应函数
    };
  }
```
2.2 中间件--洋葱流程

```javascript
/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */

function compose (middleware) {
	// 校验数组类型
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
  	// 校验中间件为函数类型
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, function next () {
          return dispatch(i + 1)
        }))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```
koa2洋葱模型的例子：
```javascript
const Koa = require('koa');

const app = new Koa();
const PORT = 3000;

// #1
app.use(async (ctx, next)=>{
    console.log(1)
    await next();
    console.log(1)
});
// #2
app.use(async (ctx, next) => {
    console.log(2)
    await next();
    console.log(2)
})

app.use(async (ctx, next) => {
    console.log(3)
})

app.listen(PORT);
console.log(`http://localhost:${PORT}`);
```
（1）启动该服务，浏览器输入`http://localhost:3000`, 控制台打印：
		`1 2 3 2 1`
（2）整个过程如下：
		- 客户端发送请求，服务端执行`fn(ctx)`，第一个参数是上下文对象，第二个参数为空；即执行dispatch(0)，输出1；
		- 接着执行`await next()`, 执行dispatch(1), 第二个中间件函数，输出2；
		- 接着执行`await next()`, 执行dispatch(2), 输出3； 此时，middleware.length === 2, 所以fn=next=undefined,直接返回上层；
		- 依次输出2，输出1

2.3 实例上挂载上下文对象
```javascript
  /**
   * Initialize a new context.
   *
   * @api private
   */

  createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.state = {};
    return context;
  }
```
该函数创建了一个上下文对象，上面挂载了app, req, res等属性。方便开发过程中（中间件里面），可以直接用上下文对象上的这些属性。

2.4 `respond()` 响应请求体的处理
```javascript
/**
 * Response helper.
 */

function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) return;

  if (!ctx.writable) return;

  const res = ctx.res;
  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ('HEAD' == ctx.method) {
    if (!res.headersSent && isJSON(body)) {
      ctx.length = Buffer.byteLength(JSON.stringify(body));
    }
    return res.end();
  }

  // status body
  if (null == body) {
    if (ctx.req.httpVersionMajor >= 2) {
      body = String(code);
    } else {
      body = ctx.message || String(code);
    }
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}
```
该响应函数，根据响应状态，头部，响应体等做了基础的处理，最终通过`res.end()`返回给前端。


## 三、koa2源码相关疑问
3.1 为什么Application继承Emitter？
答： Emitter拥有事件触发与事件监听器功能。Application继承Emitter，就可以使用事件监听器功能，监听错误。` this.on('error', this.onerror);`

3.2 context 为什么不设计成class模式？
答：目前context的写法是导出一个对象`const proto = module.exports = {}`; 我的理解可能是并不需要抽象成类吧，application使用时候，配合Object.create()。没有想到本质原因，有想法的同学，欢迎交流。

3.3  为什么要用Object.create()？
答： 首先给出Object.create()的定义： 
Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__；
且返回一个新对象，带着指定的原型对象和属性。
相当于创建一个新对象，继承了原来对象的属性和方法。

与new Object()的区别：https://www.jianshu.com/p/358d04e054b2

## 四、koa2源码中可以借鉴的地方
4.1 注释风格
主要介绍下函数的注释风格，简洁，实用。主要包括描述，参数@param, 返回@return, api性质@api
```javascript
  /**
   * Similar to .throw(), adds assertion.
   *
   *    this.assert(this.user, 401, 'Please login!');
   *
   * See: https://github.com/jshttp/http-assert
   *
   * @param {Mixed} test
   * @param {Number} status
   * @param {String} message
   * @api public
   */
  throw(...args) {
    throw createError(...args);
  },
```

4.2 TS语法
本篇提及的koa2还是es6语法，后续有机会介绍TS语法。

4.3 封装成类，对象
学习参考文档：[http://es6.ruanyifeng.com/#docs/class](http://es6.ruanyifeng.com/#docs/class)