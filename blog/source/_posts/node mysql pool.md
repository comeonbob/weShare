---
title: Node 中 mysql 应用 -- 连接池的优势
categories: Bob
tags: Node
date: "2018-08-31"
---

### 引言

从事 Node 开发已有一段时间，数据库用的是 mysql，每次执行数据库操作流程如下：创建一个连接，执行 sql 语句，然后关闭连接。当用户量不大，并发执行数据库操作不多的时候，运转一切正常。当写一个爬虫功能时候，同时执行2000条数据入库操作时，系统报错，提示超时了。意识到问题的重要性后，努力学习了一番，使用连接池解决了这一并发执行数据库操作问题。在此，分享并记录 node 中使用数据库连接池，测试连接池优势等。

### 安装 mysql
```bash
npm install mysql
```

### 如何使用单次连接
> 所谓单次连接， 指的是最基本的连接方式， 每次执行数据库操作，都会打开一个连接， 执行完之后关闭连接。

我们把它封装成一个 返回 promise 对象的函数， 便于使用。

```javascript
const mysql = require('mysql');
// 连接配置信息
const dbConfig = {
  host     : 'localhost',
  user     : 'me',
  password : 'secret',
  database : 'my_db'
};
// 导出对象
const imp = {
 // 执行
 do: (sql, para) => {
   return new Promise((resolve, reject) => {
	  let conn = mysql.createConnection(dbConfig);
	  conn .connect();
	  conn.query(sql, para, (err, rows) => {
		if (err) return reject(err);
		 return resolve(rows);
	  });
	  connection.end();
	});
 }
};

module.exports = imp;
```
其中连接配置还可以设置连接超时时间 connectTimeout，是否启用大数字 supportBigNumbers， 是否启用debug模式等，都是一些特殊场景需求，详情移步官网文档： https://www.npmjs.com/package/mysql

### 如何使用连接池
> 连接池的定义： 连接池是创建和管理一个连接的缓冲池的技术，这些连接准备好被任何需要它们的线程使用。

为每个用户打开和维护数据库连接，特别是对动态数据库驱动的网站应用程序的请求，代价高昂，浪费资源。在连接池中，在创建连接之后，将它放置在池中，并再次使用它，这样就不必建立新的连接。如果正在使用所有连接，则将创建一个新连接并将其添加到池中。连接池还减少了用户必须等待建立到数据库连接的时间。

同样的， 我们把它封装成一个 返回 promise 对象的函数， 便于使用。

```javascript
const mysql = require('mysql');
// 连接池配置
const dbPoolConfig = {
  host     : 'localhost',
  user     : 'me',
  password : 'secret',
  database : 'my_db',
  acquireTimeout: 15000, // 连接超时时间
  connectionLimit: 100, // 最大连接数
  waitForConnections: true, // 超过最大连接时排队
  queueLimit: 0, // 排队最大数量(0 代表不做限制)
};
// 创建连接池
const pool = mysql.createPool(dbPoolConfig);
const imp = {
  // 执行
  query: (sql, para) => {
    return new Promise((resolve, reject) => {
		pool.getConnection((err, conn) => {
		  if (err) return reject(err);
		  conn.query(sql, para, (err, rows) => {
		    conn.release();
		    if (err) return reject(err);
		    return resolve(rows);
		  });
		});
	});
  }
};

module.exports = imp;
```
**连接池配置参数详解** 
（1）acquireTimeout: 表示连接超时时间， 默认是10000 ms； 最大连接数越大， 连接时间越长。建议设置 15000ms

（2）connectionLimit: 最大连接数， 默认是 10； 并发操作较大时，连接数越大， 执行速度较快。
经测试， 20000 并发执行数据库查询操作， 最大连接数为 10时， 响应时长 14508ms； 最大连接数设置50， 300等，响应时长接近 11000ms。所以，建议最大连接数设置100。

（3）waitforConnections： 超过最大连接数是否等待。 默认是等待， 若设置成false， 则超过最大连接数就报错。建议设置为true。

（4）queueLimit： 排队最大数量。 默认为无限制， 0 代表无限制。 建议设置为 0。

### 对比两种连接方式性能

现在， 我们以一个查询请求作为测试用例， 查询请求中增加参数count， 代表并发执行数据库操作次数， 代码如下：

```javascript
let start_time = new Date().getTime(); // 开始时间
let pAll = [];  // promise 对象数组
let count = Number(ctx.query.count); // 执行次数
for (let i = 0; i < count; i++) {
	pAll.push(doSql()); // 添加
}
// 开始执行
let result = await Promise.all(pAll);
let end_tiem = new Date().getTime();   // 结束时间
console.log(`response time: ${end_time - start_time}`);
ctx.response.body = { code: 0, total: result.length, data: result };
```
- **并发执行1次**

|连接方式|平均响应时长(ms)|是否报错|性能|
|--|--|--|--|
| 单次连接 | 5.2       |  否    | 快 |
| 连接池  |  3.5       |  否    | 快 |

相差： 1.7 ms 

- **并发执行5次**

| 连接方式 | 平均响应时长(ms) | 是否报错 | 性能 |
| ------- | ------- | ------| ------- |
| 单次连接 | 10       |  否    | 快 |
| 连接池  |  6.1      |  否    | 快 |

相差： 3.9 ms  

- **并发执行100次**

| 连接方式 | 平均响应时长(ms) | 是否报错 | 性能 |
| ------- | ------- | ------| ------- |
| 单次连接 | 140       |  否    | 较快 |
| 连接池  |  69        |  否    | 快 |

相差： 71 ms 

- **并发执行1000次**

| 连接方式 | 平均响应时长(ms) | 是否报错 | 性能 |
| ------- | ------- | ------| ------- |
| 单次连接 | 9410       |  大概率报错    | 慢 |
| 连接池  |  635      |  否    | 快 |

相差： 8775 ms 
我们发现并发执行1000次， 单次连接方式已经不能胜任了， 而连接池方式表现依然卓越。

- **并发执行10000次**

| 连接方式 | 平均响应时长(ms) | 是否报错 | 性能 |
| ------- | ------- | ------| ------- |
| 单次连接 | 失败       |  是    | 不能使用 |
| 连接池  |  7567      |  否    | 较慢 |
连接池这种方式可以响应到1w的并发执行数，而且响应时间与执行次数几乎成倍数增加。

- **并发执行20000次**

| 连接方式 | 平均响应时长(ms) | 是否报错 | 性能 |
| ------- | ------- | ------| ------- |
| 单次连接 | 失败       |  是    | 不能使用 |
| 连接池  |  10775      |  否    | 慢 |

当并发执行2w时候，连接池依然可以使用，且响应时间没有达到预期的两倍。
接着又测试了 4w 并发执行， 响应时间约 23.2s；
6w 并发执行， 响应时间约 39.2s; 
8w 并发执行， 响应时间约 52.0s;

**测试得出初步结论：**

- 单次连接，最大并发执行约800次， 响应时长约 9.2s；
- 连接池， 最大并发执行约8w+次，  响应时长约52s；
- 并发执行数5次以内， 两者相差不大， 随着并发执行数越大， 连接池优势越大

### 查看 mysql 数据库连接数配置信息
有时，我们会遇到数据库连接，执行一些错误。以下是一些常用命令，帮助我们了解当前数据库的配置。
1. 查询最大连接数
` show variables like '%max_connections%';`

2. 设置最大连接数
` set global max_connections=1000; `

3. 响应的最大连接数
` show global status like 'Max_used_connections';`

4. 睡眠连接超时数
 ` show global variables like 'wait_timeout'; `
 
5. 杀死连接id （表： INFORMATION_SCHEMA.PROCESSLIST）
`  kill 21120003`

 更多资料：
https://blog.csdn.net/caodongfang126/article/details/52764213/
https://www.cnblogs.com/wajika/p/6763181.html
https://blog.csdn.net/wzb56_earl/article/details/51868584

### 结束语
- 连接池在并发执行数越大时， 对比单次连接方式， 优势越明显；而且支持的最大并发执行数远大于单次连接。
- 连接池随着服务的运行而创建，每次在连接池中创建连接之后，使用完释放连接，就可以再次使用它，不必建立新的连接。
- 连接池配置建议使用前文选项， 经过测试最佳。
- 后续发现数据库中连接数一直增加， 虽然是sleep状态， 但是也需要8小时后，系统才会释放。 待了解清楚原因后，尽量减少资源浪费。


---
## 2018-10-10 补充
问题： 同事在测试时， 发现单次连接和连接池方式响应时间差不多。

解答： 经过仔细对比发现原因。

（1）同事使用的是本地服务，连接本地数据库，且数据库最大连接数配置为2001；所以在并发执行数据库数在2000以内， 单次连接和连接池方式效果几乎一样。

（2）不同的是，上文测试数据的环境是本地服务， 连接远程数据库，所以每个执行数据库操作，打开和关闭连接的代价就更高，即使在最大连接数之内，单次连接效果也比连接池速度慢。

（3）当并发执行数超过最大连接数时候， 单次连接就会报错， too many connections； 而此时， 连接池依然可以使用，且执行速度也比较快。原因是使用连接池方式，我们设置了最大连接数是200（小于数据库的最大连接数）， 超过200后，连接池中会把执行动作排队，按批次执行。


---
## 2018-12-27 补充
问题：通过mysql中执行`show full processlist`，发现大量睡眠连接，是什么引起的，是否需要关闭等。

解答：

（1）引起大量sleep状态连接的原因是，我们创建连接池，其中的连接执行完后，释放之后，不会销毁，变成sleep状态，供下次调用。

（2）其实是不需要主动关闭的，因为睡眠连接池不会一直增加，最大数量取决于系统的最高执行数据库操作的并发量。

（3）数据库中执行 `show global variables like '%timeout'`, 其中`wait_timeout`就是sleep连接关闭时间，默认为8小时。 若想调整 `set global wait_timeout=60`, 意味着1分钟后，所有sleep状态的连接都会关闭。


