---
title: 浏览器与Node环境下的EventLoop
categories: Emfan
tags: JS
date: "2018-08-06"
---
-  什么是Event Loop？
-  Event Loop是遵循什么规则实现的？
-  Event Loop在浏览器与Node中的实现原理有什么区别？

> 基于JavaScript语言的单线程特点，所有的任务排列在JS的主线程中执行，即“任务队列”。
JS主线程从"任务队列"中读取事件，这个过程是循环不断的，所以整个的这种运行机制又称为Event Loop（事件循环）。

----------
> 浏览器中与node中事件循环与执行机制不同，不可混为一谈。
浏览器的Event loop是在HTML5中定义的规范，而node中则由libuv库实现。

---------

### 1、浏览器环境中的Event Loop

- 任务队列：
宏任务(MacroTask)：script 中代码、setTimeout、setInterval、I/O、UI render；
微任务(MicroTask)： Promise、Object.observe（已废弃）、MutationObserver（H5新特性）。

- 执行顺序：
执行完主线程``<script>``中的同步任务；
取出 Microtask 队列中任务执行直到清空；
取出 Macrotask 队列中一个任务执行；
重复 第2步 和 第3步 。


------------------

### 2、Node环境中的Event Loop

- 任务队列：
microTask：微任务；
nextTick：process.nextTick；
timers：执行满足条件的 setTimeout 、setInterval 回调；
I/O callbacks：能否有已完成的 I/O 操作的回调函数，来自上一轮的 poll 残留；
idle/prepare ：闲置阶段；
poll：等待还没完成的 I/O 事件，会因 timers 和超时时间等结束等待；
check：执行 setImmediate 的回调；
close callbacks：关闭所有的 closing handles ，少量 onclose 事件。

- 执行顺序：
**注**：从返回结果的表现状况来看，大致与浏览器环境下的结果相同。
- 首次进入循环：同步代码--> 执行process.nextTick()--> 进入poll(轮询阶段，执行Microtask Queue)--> 开始循环。
- 循环中的操作：
清空当前循环内的 Timers Queue，清空 NextTick Queue，清空 Microtask Queue；
清空当前循环内的 I/O Queue，清空 NextTick Queue，清空 Microtask Queue；
idle/prepare(闲置阶段)；
poll(轮询阶段)；
清空当前循环内的 Check Queue，清空 NextTick Queue，清空 Microtask Queue；
清空当前循环内的 Close Queue，清空 NextTick Queue，清空 Microtask Queue；
进入下轮循环。


### 3、代码用例：
```
console.log('golb1');

setTimeout(function() {
    console.log('timeout1');
    process.nextTick(function() {
        console.log('timeout1_nextTick');
    })
    new Promise(function(resolve) {
        console.log('timeout1_promise');
        resolve();
    }).then(function() {
        console.log('timeout1_then')
    })
})

setImmediate(function() {
    console.log('immediate1');
    process.nextTick(function() {
        console.log('immediate1_nextTick');
    })
    new Promise(function(resolve) {
        console.log('immediate1_promise');
        resolve();
    }).then(function() {
        console.log('immediate1_then')
    })
})

process.nextTick(function() {
    console.log('glob1_nextTick');
})
new Promise(function(resolve) {
    console.log('glob1_promise');
    resolve();
}).then(function() {
    console.log('glob1_then')
})

setTimeout(function() {
    console.log('timeout2');
    process.nextTick(function() {
        console.log('timeout2_nextTick');
    })
    new Promise(function(resolve) {
        console.log('timeout2_promise');
        resolve();
    }).then(function() {
        console.log('timeout2_then')
    })
})

process.nextTick(function() {
    console.log('glob2_nextTick');
})
new Promise(function(resolve) {
    console.log('glob2_promise');
    resolve();
}).then(function() {
    console.log('glob2_then')
})

setImmediate(function() {
    console.log('immediate2');
    process.nextTick(function() {
        console.log('immediate2_nextTick');
    })
    new Promise(function(resolve) {
        console.log('immediate2_promise');
        resolve();
    }).then(function() {
        console.log('immediate2_then')
    })
})
```

文章部分理论参考自：https://yiweifen.com/v-1-332899.html






