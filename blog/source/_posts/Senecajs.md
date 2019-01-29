---
title: Seneca：NodeJS 微服务框架入门（一）
categories: Bob
tags: Node
date: "2019-01-29"
---

## Seneca是什么？
（1）[官网](http://senecajs.org/)是这样介绍的：

> Seneca is a microservices toolkit for Node.js. 
It helps you write clean, organized code that you can scale and deploy at any time.

大概意思是：Seneca是一个库，在Node平台上开发微服务时用的，它能够帮助开发人员写出干净、有组织的代码，同时也利于项目更新和部署。

（2）百度百科是这样介绍的：

> Seneca是Node.js微服务框架开发工具。它的目的在于复制架构师和开发人员的服务想法，提供方法把代码融入到由模式所触发的逻辑行为中，这是根据用例所作用的模型。一旦被定义，模式就可以轻松转为API，使用用例和模式来定义消息内容。

除了第一句好理解，Seneca是一个Node.js微服务框架的开发工具，后面讲的就比较抽象了；模式可以轻松转API，所以什么是模式呢？

## 为什么要用Seneca？
我们前面已经了解到Seneca是在Node平台上开发微服务框架时候用的，那么我们为什么要选择它呢，它有哪些好处？
- 代码结构清晰
- 使项目易于更新，部署

Seneca 能做到这些，原因在于它的三大核心功能：
- 模式匹配
- 无依赖传输（可以是消息，http，tcp等）
- 组件化（插件）

后面将会结合代码示例，详细介绍如何使用这三大功能。

## 怎么样使用Seneca？
### 模式匹配 （Patterns ）
（1）模式匹配是什么？

我们知道微服务中存在两个角色，一个服务端，一个客户端；通常服务端以Restful API形式提供微服务， 客户端通过HTTP 请求调用微服务。而使用Seneca，服务调用是基于消息的，消息之间则通过模式匹配来确保服务的唯一性；消息就是一个可以有任何你喜欢的内部结构的 JSON 对象。
一个简单的示例，一个进行数学计算，另一个调用它
```javascript
const seneca = require('seneca')();

seneca.add('role:math, cmd:sum', (msg, reply) => {
  reply(null, { answer: ( msg.left + msg.right )})
});

seneca.act({ role: 'math', cmd: 'sum', left: 1,  right: 2 }, (err, result) => {
  if (err) {
    return console.error(err);
  }
  console.log(result);
});
```
服务端添加服务：seneca.add()
客户端调用服务： seneca.act()
中间的消息，通过模式匹配。

（2）模式匹配几大特点

- 优先多属性匹配原则
- 模式唯一
- 代码复用

其中，前面两点比较好理解，匹配的属性越多，优先级越高，调用对应的服务；模式唯一，意思是服务端Seneca.add时的匹配消息不能重复，可以按照模块来；代码复用，基于模式的代码复用this.act

（3）如何使用插件（组件化）

Seneca插件只是一组操作模式的集合，简单来说，Seneca插件就只是一个具有单个参数选项的函数，你将这个插件定义函数传递给 seneca.use 方法，下面是个简单的的Seneca插件：
```javascript
function my_plugin(options) {
  console.log(options)
  this.add('role:math,cmd:sum', function (msg, respond) {
    respond(null, { answer: msg.left + msg.right })
  })
}

require('seneca')()
  .use(my_plugin, {name: 'bob'})
    .act('role:math,cmd:sum,left:1,right:2', console.log)
```

## express + Seneca集成微服务
项目启动文件， app.js
```javascript
var SenecaWeb = require('seneca-web')
var Express = require('express')
var Router = Express.Router
var context = new Router()

var senecaWebConfig = {
      context: context,
      adapter: require('seneca-web-adapter-express'),
      options: { parseBody: false } // so we can use body-parser
}

var app = Express()
      .use( require('body-parser').json() )
      .use( context )
      .listen(3000)

var seneca = require('seneca')()
      .use(SenecaWeb, senecaWebConfig )
      .use('../services/api')
      .client( { type:'tcp', pin:'role:math' } )
```

根目录下创建services文件夹，文件夹下路由处理文件，api.js
```javascript
module.exports = function api(options) {

  var valid_ops = { sum:'sum', product:'product' }

  this.add('role:api,path:calculate', function (msg, respond) {
    var operation = msg.args.params.operation
    var left = msg.args.query.left
    var right = msg.args.query.right
    this.act('role:math', {
      cmd:   valid_ops[operation],
      left:  left,
      right: right,
    }, respond)
  })


  this.add('init:api', function (msg, respond) {
    this.act('role:web',{routes:{
      prefix: '/api',
      pin:    'role:api,path:*',
      map: {
        calculate: { GET:true, suffix:'/:operation' }
      }
    }}, respond)
  })

}
```
services目录下，服务端，math.js
```javascript
module.exports = function math(options) {

  this.add('role:math,cmd:sum', function sum(msg, respond) {
    respond(null, { answer: msg.left + msg.right })
  })

  this.add('role:math,cmd:product', function product(msg, respond) {
    respond(null, { answer: msg.left * msg.right })
  })

  this.wrap('role:math', function (msg, respond) {
    msg.left  = Number(msg.left).valueOf()
    msg.right = Number(msg.right).valueOf()
    this.prior(msg, respond)
  })

}
```
services目录下，服务端启动文件，math-pin-service.js
```javascript
require('seneca')()

  .use('math')

  // listen for role:math messages
  // IMPORTANT: must match client
  .listen({ type: 'tcp', pin: 'role:math' })
```

先安装依赖，然后先启动微服务： `node services/math-pin-service.js`

然后启动express项目，监听3000端口： node app.js

最后在浏览器中访问： http://localhost:3000/api/calculate/product?left=2&right=3

## koa2+ Seneca集成微服务
koa2与express差不多，部分依赖插件不一致，我们新建app-koa2.js 代替app.js, 其它文件不变。

app-koa2.js
```javascript
const Koa = require('koa')
const app = new Koa();
const Router = require('koa-router')
const koaBody = require('koa-body');
const SenecaWeb = require('seneca-web')
const Seneca = require('seneca')
const seneca = Seneca();

app.use(koaBody());
// app.use(Router().routes());
// app.use(Router().allowedMethods());
app.listen(3000);


const senecaWebConfig = {
      context: Router(),
      adapter: require('seneca-web-adapter-koa2')
}
seneca.use(SenecaWeb, senecaWebConfig );
seneca.use('../services/api');
seneca.client( { type:'tcp', pin:'role:math' } );
seneca.ready(() => {
  app.use(seneca.export('web/context')().routes())
});
```

安装完依赖，效果同express。

## 小结
本篇文章作为Seneca入门篇，简单介绍了Seneca是一个库，在Node平台上开发微服务时用的，使用它能使代码结构清晰，项目易于更新，部署；同时介绍了它的几大特点，最后给出示例集成express,koa2。

**Seneca进阶知识扩展**

- Seneca with Promises http://senecajs.org/docs/tutorials/seneca-with-promises.html
- Seneca集成express中实现原理 https://github.com/senecajs/seneca-web/blob/master/web.js


想必关于Seneca还有很多疑问，后续还会继续更新，欢迎交流。


## 参考文章
- Seneca 官网Quick Start: http://senecajs.org/getting-started/
- Seneca Quick Start中文版： https://segmentfault.com/a/1190000008501410#articleHeader0
