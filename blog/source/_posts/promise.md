---
title: Promise
categories: Dawn
tags: JS
date: "2018-08-08"
---

## 从callback和异步说起：

JS是一门单线程语言，通过回调函数来实现异步和并发。由于回调函数的多层嵌套而造成代码的阅读性差和逻辑调理混乱被称之为回调地狱。为了解决回调地狱的问题，相继出现了promise和 await/async.

<!--more-->
### Promise   Callback 对比

1 promise更好的解耦 

promise将发起异步请求放在传入Promise的函数体中，而在获得异步返回后的行为则放在了then中，通过resolve或者reject来触发then中的事件处理函数，很好的做到解耦。

callback方式，直接传递callback handler。这使得具体callback失去了对具体事件处理调用的次数和时机权利

2 callback回调地狱 

由于复杂的业务逻辑，常常需要嵌套的调用回调函数，使得代码逻辑混杂难以阅读和维护。

Promise通过链式调用，在很大程度上缓解了这一问题，在更新的async/await中，更好的解决了这一问题。async/await可以看成是promise的语法糖。

### 什么是promise

承诺 承诺，一但定下立即生效，在未来的某个时间一定返回结果.

承诺，一但定下立即生效，在未来的某个时间一定返回结果.

分析promise

```javascript
//Promise结构
Promise(function(resolve, reject) {
    // resolve(futureValue)
    // reject(futureValue)
}).then(fullfilledHandler, rejectedHandler)
```

#### future value 

结果产生在未来的某个时刻，结果是未知的。

```javascript
function add(xPromise,yPromise) {
	// `Promise.all([ .. ])` takes an array of promises,
	// and returns a new promise that waits on them
	// all to finish
	return Promise.all( [xPromise, yPromise] )

	// when that promise is resolved, let's take the
	// received `X` and `Y` values and add them together.
	.then( function(values){
		// `values` is an array of the messages from the
		// previously resolved promises
		return values[0] + values[1];
	} );
}

// `fetchX()` and `fetchY()` return promises for
// their respective values, which may be ready
// *now* or *later*.
add( fetchX(), fetchY() )

// we get a promise back for the sum of those
// two numbers.
// now we chain-call `then(..)` to wait for the
// resolution of that returned promise.
.then( function(sum){
	console.log( sum ); // that was easier!
} );
```

#### completion event, error event

     也可以把Promise看成两种不同的事件及其回调的整合。回调函数的异步实现机制是通过绑定事件来触发回调函数，从而进行异步控制和并发。Promise则通过resolve和reject来触发完成事件或者拒绝事件，成功转入到fullfilledHandler,失败转入到rejectedHandler

```javascript
new Promise((resolve, reject) => {
    //resolve(1) 触发 then的 第一个handler
    //reject (2) 触发 then的 第二个handler
}.then(fullfilledHander, rejectedHandler)
```

promise的核心是then方法，then方法做的事情类似于回调函数做的事情。在完成promise函数体内部的任务后，通过resolve或者reject来触发。类似于绑定事件触发回调函数，promise总是异步的。

```javascript
new Promise((r) => {
    console.log(2)
    r(1)
}).then(v => console.log(v))
console.log(3)
```

上面的例子表明：1. then中的代码块是异步运行的，即便没有等待异步事件。   2.Promise一旦被new出来会立即执行。

### Promise 3大状态 

Promise有pending， resolved, rejected三个状态 刚生成的promise处于pending状态，在resolve了之后转入到resolved状态，在reject之后转入到rejected状态。

```javascript
new Promise((resolve, reject) => {
}) //pending
new Promise((resolve, reject) => {
    resolve(1)
}) //resolved
new Promise((resolve, reject) => {
    reject(1)
}) // rejected
```

\[\[PromiseStatus\]\]: "rejected" // resolved, pending

 \[\[PromiseValue\]\]: value // 通过 resolve, reject 函数传入

###  Most important characteristic trust

* Call the callback too early
* Call the callback too late \(or never\)
* Call the callback too few or too many times
* Fail to pass along any necessary environment/parameters
* Swallow any errors/exceptions that may happen

#### call the callback  too early

Zalgo-like effects

```javascript
function result(data) {
	console.log( a );
}

var a = 0;

ajax( "..pre-cached-url..", result );
a++;
```



#### Call the callback too late \(or never\)

```javascript
p.then( function(){
	p.then( function(){
		console.log( "C" );
	} );
	console.log( "A" );
} );
p.then( function(){
	console.log( "B" );
} );
// A B C
```

call the callback too earyly 和 call the callback too late 会导致竞态条件（race condition\),而导致程序异常。\(竞态条件是指程序推进顺序不同而造成结果不同）

promise 一旦 resolve或者reject，注册的所有的then会 imediately 触发（这里的imediately是异步的立即的），有序触发如上例。



#### Call the callback too few or too many times

```javascript
let p = new Promise(function(resolve, reject){
    setTimeout(() => resolve(1), 300)
    reject(2)
}).then(result=>console.log(result), error=>console.log(error))
```

在一个promise中只能触发第一个resolve或者reject。resolve或者reject将会把value传递给then.resolve传递给第一个参数，reject传递个第二个参数.



#### Fail to pass along any necessary environment/parameters

  promise通过resolve/reject来传递参数，通过闭包来储存环境。（注意: resolve/rejct只有第一个参数会被传递，其他参数会被忽略，所以如果要传递多个参数需要进行封装）



#### Swallow any errors/exceptions that may happen

当promise的函数体中出现run time exception时，会将runtime exception传递给then的第二个参数（或者catch\)

```javascript
let p = new Promise((resolve,reject) => {
    f()
}).catch(err => console.log(err))
```

catch函数可以直接获取reject传递的参数，可以把它当做then的一个特例。被catch或者then通过第二个参数捕获到的错误不会报出exception。同时，如果有没有被catch的reject的value，会以exception的方式来显示。杜绝错误被吞咽而不被发现。



### thenable 与 ducktype\(is a, is like a\)

ducktype常用与弱类型语言的类型判断。强类型语言判断是否是一个种类，要判断他是否是这个类型。而对于弱类型语言只需要判断他像这个类型，又能做这个类型能做的事情。由此，引出了thenable对象。thenable是类型为Object或者function，其拥有then方法（包括其原型链上有then方法\)。

thenable按照ducktype的说法是可以当做promise的，但实际上他并不能作为promise。

粗略判断promise的方式

```javascript
if (
	p !== null &&
	(
		typeof p === "object" ||
		typeof p === "function"
	) &&
	typeof p.then === "function"
) {
	// assume it's a thenable!
}
else {
	// not a thenable
}
```

例子\(from You Don't Know JS\)

```javascript
var p = {
    then: function(cb,errcb) {
        cb( 42 );
        errcb( "evil laugh" );
    }
};

p
.then(
    function fulfilled(val){
        console.log( val ); // 42
    },
    function rejected(err){
        // oops, shouldn't have run
        console.log( err ); // evil laugh
    }
);
```

可以作为resolve, reject的参数

1. value
2. thenable
3. promise

不同的处理，

* value会被直接传给then
* thenable会被unwrap，并且会纠正thenable使之可以被当成promise接受
* 接受promise,并以promise resolve/reject的结果来填充 \[\[PromiseStatus\]\]  \[\[PromiseValue\]\]

```javascript
var thenable1 = {
    then: () => console.log(1)
}
new Promise((resolve, reject) => {
    resolve(thenable1)
}).then(() => {})   // output 1

var thenable2 = {
    then:(cb, errcb) => {
        cb('resolve');
        errcb('reject');
    }
}
new Promise((resolve, reject) => {
    resolve(thenable2);
}).then(res => console.log(res), err => console.log(err))
```



### then, chain

then的返回一定是一个promise，如果不是那么就把他转换成。由于then的返回值是promise所以，可以形成Promise链。 对于多个Promise具有强依赖前驱后继关系的时候使用。

```javascript
Promise.resolve(1).then(() => 2).then()
// Promise {<resolved>: 1}

Promise.resolve(1).then(() => { 
	return new Promise((r) => {r(3)}) }) 
// Promise {<resolved>: undefined}

Promise.resolve(1).then(() => {
	return { then: () => console.log('thenalbe') }
}) // thenable

```

### Promise与闭包

```javascript
var service = function(path) {
    const baseUrl = getBaseURL()
    const url = baseURL + path
    return new Promise(resolve, reject){
        if(code === 0 && res) resolve(res)
        else reject(errMsg)
    })
}
```

因为Promise对象创建后立即执行，所以通常会把他封装在函数中。之前也提到过，通过闭包来保存enviroment

Promise.resolve Promise.reject

### Promise.all ,Promise.race, 

对于多个promise，要求全部完成，而各个promise之间又没有强依赖的时候使用

Promise.all\(\[promise1, promise2\]\)

对于都个promise，只要有一个完成就可以执行下一步操作的情况

Promise.race\(\[promise1, promise2\]\)

```javascript
getAccessPoint() { 
 var timeout;
 return Promise.race([bridge.getCurrentAP(),new Promise((resolve, reject) => { 
       timeout = setTimeout(function(){
             reject('Timeout'); 
       }, 2000);//timeout of getting access point from app.
       })]).then((payload) => {
            clearTimeout(timeout); 
            if (!payload) { return; } 
            if (payload.uc && payload.uc.length > 0) { 
                GLOBAL_API.conf.apiBase = payload.uc[0] + '/'
            } 
            if (payload.oss && payload.oss.length > 0) {
                GLOBAL_API.conf.ossBase = payload.oss[0] + '/' } 
        }).catch((msg) => { 
            console.warn('getAccessPoint', msg); 
        }) 
}
```



