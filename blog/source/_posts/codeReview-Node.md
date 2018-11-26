---
title: Code Review In Node
categories: Bob
tags: Node
date: "2018-11-26"
---

本次 code review 主要从代码规范，性能，安全，可重用性等出发，从过去的项目中找出两个需要改进的地方，和两个做的好的地方进行代码分析讲解。

## 1.需要改进的代码
### 1.1 demo1

**问题描述**

代码结构未分离，维护成本高，代码利用率低

**框架**

express

**源码分析**

登录注册模块：login.js

```javascript
/** 批量开户 */
router.route('/xxx').post(multipartMiddleware, function(req, res) {
  // 变量
  var a,b,c;

  // 主流程
  do1()
  .then(() => {
    do2();
  })
  .then(() => {
    do3();
    // ... more
  })
  .catch(err => {
    return res.json({ code: -1, msg: "error" });
  });

  function do1() {};
  function do2() {};
  function do3() {};
  // ... more
});

```
**我们可以看出有以下几点不足：**

（1）所有逻辑都在router层完成，没有分离出控制层，数据层，服务层；

（2）代码重复利用率低， 若有其它模块用到相同函数do1(),do2()等，需要再次重写，维护多份相同代码。

（3）维护成本高，若是需要更新需求，或是修复bug，需要整个函数过一遍，修改成本高，调试成本高。


### 1.2 demo2

**问题描述**

异步处理不够简洁，代码冗余，异常错误处理繁琐

**框架**

express

**源码分析**

连接数据库模块：dac.js

```javascript
/** 执行sql封装 -- 单次连接*/
var dac = {
  query_old: function (sql, para, callback) {
    // 每次需要创建新的连接
    var connection = mysql.createConnection({
      host: config.dbHost,
      user: config.dbUser,
      password: config.dbPWD,
      port: config.dbPort,
      database: config.dbName
    });
    connection.connect();
    connection.query(sql, para, function (err, rows) {
    // 回调处理异步，不够优雅
      callback(err, rows);
    });
    connection.end();
  },
  /** 执行sql封装 -- 连接池*/
  query_new: (sql, para) => {
    pool.getConnection((err, conn) => {
      if (err) return Promise.reject(err);
      conn.query(sql, para, (err, rows) => {
        conn.release();
        if (err) return Promise.reject(err);
        // Promise 回调
        return Promise.resolve(rows);
      });
    });
  }
}

module.exports = dac;
```
调用对比
```javascript
const dac = require('./dac');
const imp = {
  // 回调方式
  do1: () => {
    let sql1 = `xxx`;
    dac.query_old(sql1, param, function(err, rows) {
      // 每次都要处理异常错误，冗余且繁琐
      if (err) {
        return Promise.reject(err);
      }
      let sql2 = `xxx`;
      dac.query_old(sql2, param, function (err, rows) {
        if (err) {
          return Promise.reject(err);
        }
        let sql3 = `xxx`;
        dac.query_old(sql3, param, function (err, rows) {
          // ...
          // 回调地狱
        });
      });
    });
  },
  // promise方式
  do2: () => {
    let sql1 = `xxx`;
    let sql2 = `xxx`;
    let sql3 = `xxx`;
    return dac.query_new(sql1, param);
    .then(rows => {
      return dac.query_new(sql2, param);
    })
    .then(rows => {
      return dac.query_new(sql3, param);
    })
    .then(rows => {
      // ...
      // 结构清晰
    })
    .catch(err => {
      return Promsie.reject(err);
    });
  }，

  // async方式
  do3: async () => {
    let sql1 = `xxx`;
    let sql2 = `xxx`;
    let sql3 = `xxx`;
    try {
      let data1 = await dac.query_new(sql1, param);
      let data2 = await dac.query_new(sql2, param);
      let data3 = await dac.query_new(sql23, param);
      // ... 
    } catch (err) {
      return Promise.reject(err);
    }
    return Promise.resolve(data3);
  }
}

module.exports = imp;
```

我们可以看出有以下几点不足：

（1）单次连接方式，每次执行数据库相关操作，都会创建新的连接，消耗更多资源，支持的并发连接数较低，并发请求数较大时性能较差。

（2）代码冗余，不够简洁，每次执行数据库操作都要处理异常错误。

（3）回调方式处理异步不够优雅，对比Promise会清晰很多，aysnc更加简洁。



## 2.可以借鉴的代码
### 2.1 demo1

**推荐描述**

代码结构清晰，便于维护，便于扩展，支持单元测试，异常统一处理

**框架**

koa2

**源码分析**

（1）目录结构，模块拆分为5大部分
```
router     // 路由层，与API文档一一对应
controller // 控制层，参数处理，调用处理
models     // 数据层，执行sql相关
services   // 公共服务层（如工具函数，邮件服务，消息服务等）
test       // 单元测试 (koa2 与 AVA 完美融合，很方便部署)
...

```
（2）路由层： router.js

```javascript

/** 异常统一处理 */
router.all('*', controllers.errorHandle);

/** 权限统一处理 */
router.all('*', controllers.checkSession);

/** 业务1 */
router.get('/xxx1', controllers.do1);

/** 业务2 */
router.get('/xxx2', controllers.do2);

/** 业务3 */
router.post('/xxx3', controllers.do3);

// ... more

module.exports = router;

```

（3）控制层: controller.js
``` javascript
const imp = {};

/** 异常统一处理 */
imp.errorHandle = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('system error', err);
    // 自定义异常处理
    ctx.response.body = { code: errCode.system_err, msg: "system error" };
  }
};

/** 权限统一处理 */
imp.checkSession = async (ctx, next) => {
  let data = await xxx.check();
  ctx.response.body = data;
}

/** 业务1 */
imp.do1() = async (ctx, next) => {
  await xxx.do1();
  ctx.response.body = { code: 0, msg: '' };
}

/** 业务2 */
imp.do2() = async (ctx, next) => {
  await xxx.do2();
  ctx.response.body = { code: 0, msg: '' };
}

/** 业务3 */
imp.do3() = async (ctx, next) => {
  await xxx.do3();
  ctx.response.body = { code: 0, msg: '' };
}

// ... more

module.exports = imp;

```

（4）数据层: model.js

  `一般执行数据库相关操作，下个demo有具体介绍`

 （5）公共服务层：services.js

 ` 一般提供工具函数，邮件服务，消息服务等`

**我们可以看出有以下优点：**

（1）代码结构清晰，异常集中处理， async 语法处理异步非常简洁。其中API层与router层一一对应， router层对应controller层，由controller层完成统一调度；

（2）代码重复利用率高，如若两个业务逻辑有相同的部分，可以在controller层重复调用model层，和service层。

（3）维护方便，若是需要更新需求，或是修复bug，只需要找到对应入口，一层一层递进检查，思路清晰。

（4）很方便扩展单元测试，如AVA，测试公共服务，和router引入。


### 2.2 demo2

**推荐描述**

使用class类, extends继承，可重用性高；引入面向对象思想，便于扩展更多的设计模式

**框架**

express，koa2

**源码分析**

普通用户和管理员模块：user.js, adminUser.js

```javascript
/** user.js */
class User {
  // 构造函数
  constructor() {
  }

  // 新增用户
  addUser() {
    check(); //检查
    register(); //注册
    send(); // 发送邮件
  }
  // 更新用户
  updateUser() {
    check(); // 检查
    update1(); // 更新1
    update2(); // 更新2
  }

  // ... more
};

module.exports = user;
```
```javascript
/** adminUser.js */
class AdminUser extends user {
  // 构造函数
  constructor() {
    super();
  }

  // 新增用户
  addAdminUser() {
    // check(); //检查
    // register(); //注册
    // send(); // 发送邮件
    super.addUser(); // 继承普通用户新增
    addSpecial(); // 增加不同之处
  }
  // 更新用户
  updateAdminUser() {
    // check(); // 检查
    // update1(); // 更新1
    // update2(); // 更新2
    super.updateUser();  // 继承普通用户更新
    updateSpecial(); // 更新不同之处
  }

  // ... more
};

module.exports = AdminUser;
```

我们可以看出有以下几点优势：

（1）操作adminUser时，不需要把普通用户的代码重新写，且很容易看出普通用户与管理员区别，代码精简，维护方便;

（2）引入面向对象思想，实现了继承，管理员也是一个普通用户，加上还有一些特殊需求;

（3）model层是封装成类，调用时可以创建多个不同的实例，便于扩展更多的设计模式。

