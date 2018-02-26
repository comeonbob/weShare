// 单线程,每个时间点，只能有一个任务在执行。js是单线程的。
// 同步和异步。一段程序能立即得到结果叫同步，需要额外操作才能得到结果叫异步。
// 浏览器引擎。js是单线程的，但浏览器不是，浏览器除了js引擎，还有ui渲染引擎，网络编程等。
// macro-task和micro-task
// macro-task: setTimeout, setInterval, setInmediate, I/O
// micro-task: process.nextTick, promise, Object.observe, MutationObserver
// 题一
// setTimeout(function() {console.log(4)}, 0)
// new Promise(function executor(resolve) {
//     console.log(1)
//     for( var i=0 ; i<10000 ; i++ ) {
//         i == 9999 && resolve()
//     }
//     console.log(2)
// }).then(function() {
//     console.log(5)
// });
// console.log(3)
// 题二
// console.log('golb1');
// setImmediate(function() {
//     console.log('immediate1');
//     process.nextTick(function() {
//         console.log('immediate1_nextTick');
//     })
//     new Promise(function(resolve) {
//         console.log('immediate1_promise');
//         resolve();
//     }).then(function() {
//         console.log('immediate1_then')
//     })
// })
// setTimeout(function() {
//     console.log('timeout1');
//     process.nextTick(function() {
//         console.log('timeout1_nextTick');
//     })
//     new Promise(function(resolve) {
//         console.log('timeout1_promise');
//         resolve();
//     }).then(function() {
//         console.log('timeout1_then')
//     })
//     setTimeout(function() {
//     	console.log('timeout1_timeout1');
//     process.nextTick(function() {
//         console.log('timeout1_timeout1_nextTick');
//     })
//     setImmediate(function() {
//     	console.log('timeout1_setImmediate1');
//     })
//     });
// })
// new Promise(function(resolve) {
//     console.log('glob1_promise');
//     resolve();
// }).then(function() {
//     console.log('glob1_then')
// })
// process.nextTick(function() {
//     console.log('glob1_nextTick');
// })