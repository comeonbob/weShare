---
title: Async
categories: Little
tags: JS
date: "2018-09-26"

---

## Async

#### 1.什么是异步？

异步是相对同步而言。

同步是一件事一件事的执行，只有前一个任务执行完成，才能执行后一个任务。

#### 2.为什么要使用异步？

javascript是单线程的。

#### 3.为什么js不设计成多线程？

这主要跟javascript的历史有关，js最开始只是为了处理一些表单验证和DOM操作而被创造出来的，所以主要为了语言的轻量和简单采用了单线程的模式。多线程模型相比单线程要复杂很多，比如多线程需要处理线程间资源的共享问题，还要解决状态同步等问题。

如果JS是多线程的话，当你要执行往div中插入一个DOM的操作的同时，另一个线程执行了删除这个div的操作，这个时候就会出现很多问题，我们还需要为此增加锁机制等。

#### 4.如何实现异步？

JS的事件循环机制(Event Loop)。

#### 5.js的异步编程模式

1. **回调函数**

2. **事件监听**

3. **观察者模式**

4. **Promsie**

5. **Generator**

6. **async/await**


例：三个异步函数a，b，c，每隔一秒依次输出a，b，c。

（1）回调函数。

``` javascript
function a (callback1, callback2) {
	setTimeout(() => {
		console.log('a')
		callback1(callback2)
	}, 1000)
}

function b (callback) {
	setTimeout(() => {
		console.log('b')
		callback()	
	}, 1000)
}

function c () {
	setTimeout(() => {
		console.log('c')
	}, 1000)
}

a(b, c)
```

（2）事件监听。

```
<div id="c">
	<div id="b">
		<div id="a">
		</div>
	</div>
</div>

document.getElementById("c").addEventListener("click", e => {
    setTimeout(() => {
        console.log('c')
    }, 1000)
}, false)

document.getElementById("b").addEventListener("click", e => {
    e.stopPropagation()
    setTimeout(() => {
        console.log('b')
        document.getElementById("c").click()
    }, 1000)
}, false)

document.getElementById("a").addEventListener("click", e => {
    e.stopPropagation()
    setTimeout(() => {
        console.log('a')
        document.getElementById("b").click()
    }, 1000)
}, false)
```

（3）观察者模式，也叫发布/订阅模式。

```
function MessageCenter(){
    var _messages = {};
 
    // 对于regist方法，它只负责注册消息，就只接收一个注册消息的类型(标识)参数就好了。
    this.regist = function(msgType){
        // 判断是否重复注册
        if(typeof _messages[msgType] === 'undefined'){
            _messages[msgType] = [];    // 数组中会存放订阅者
        }else{
            console.log('这个消息已经注册过了');
        }
    }
 
    // 对于subscribe方法，需要订阅者和已经注册了的消息进行绑定
    // 由于订阅者得到消息后需要处理消息，所以他是一个个的函数
    this.subscribe = function(msgType, subFn){
        // 判断是否有这个消息
        if(typeof _messages[msgType] !== 'undefined'){
            _messages[msgType].push(subFn);
        }else{
            console.log('这个消息还没注册过，无法订阅')
        }
    }
 
    // 最后我们实现下fire这个方法，就是去发布某条消息，并通知订阅这条消息的所有订阅者函数
    this.fire = function(msgType, args){    
        // msgType是消息类型或者说是消息标识，而args可以设置这条消息的附加信息
 
        // 还是发布消息时，判断下有没有这条消息
        if(typeof _messages[msgType] === 'undefined') {
            console.log('没有这条消息，无法发布');
            return false;
        }
 
        var events = {
            type: msgType,
            args: args || {}
        };
 
        _messages[msgType].forEach(function(sub){
            sub(events);
        })
    }
}

```

```
const msgCenter = new MessageCenter()

const a = function () {
	setTimeout(() => {
		console.log('a')
		msgCenter.fire('a')
	}, 1000)
}
const b = function () {
	setTimeout(() => {
		console.log('b')
		msgCenter.fire('b')
	}, 1000)
}
const c = function () {
	setTimeout(() => {
		console.log('c')
	}, 1000)
}

msgCenter.regist('a')
msgCenter.subscribe('a', b)
msgCenter.regist('b')
msgCenter.subscribe('b', c)
 
a()

```

（4）Promise。

Promise 是异步编程的一种解决方案，比传统的解决方案——回调函数和事件——更合理和更强大。

```
const a = function () {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log('a')
			resolve()
		}, 1000)
	})
}
const b = function () {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log('b')
			resolve()
		}, 1000)
	})
}
const c = function () {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			console.log('c')
			resolve()
		}, 1000)
	})
}
```

```
a().then(() => {
	return b()
})
.then(() => {
	return c()
})
.catch(error => console.log(error))
```

（5）Generator。

Generator 函数是 ES6 提供的一种异步编程解决方案，语法行为与传统函数完全不同。

```
const gen = function* () {
	yield a()
	yield b()
	yield c()
}
const run = function (gen) {
	const g = gen()
	function next(data) {
		const result = g.next(data)
		if (result.done) return result.value
		result.value.then(data => {
			next(data)
		})
	}
	next()
}
run(gen)
```

（6）async/await。

async/await是是Generator 函数的语法糖，async函数就是将 Generator 函数的星号（*）替换成async，将yield替换成await，仅此而已。

与Generator区别：

（1）内置执行器。

（2）更好的语义。

（3）返回值是Promise。

```
const run = async function () {
	await a()
	await b()
	await c()
}
run()
```

