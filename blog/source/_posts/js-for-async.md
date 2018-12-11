---
title: JS 遍历中异步操作
categories: Bob
tags: JS
date: "2018-04-26"
---

### 引言
  JS遍历中异步操作，指的是JS执行循环遍历中，每一次循环里,都有异步操作。 如经典的闭包应用，每次循环异步操作中输出索引。

```javascript

for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log('i', i);
  }, 10);
}
// i 3
// i 3
// i 3
```
  结果发现，每次输出的都是3，并不是我们预期的结果。
  不同遍历方法中异步操作，如何正确得到循环索引，这就是今天的主题。 当然，闭包就是其中一种解决方法。

### 解决方法

- for循环 + var + 索引传参
```javascript
for (var i = 0; i < 3; i++) {
  (function(i) {
    setTimeout(() => {
      console.log('i', i);
    }, 10);
  })(i);
}
// i 0
// i 1
// i 2
```
**解析**： 

> 每次循环， 都会执行一个匿名函数，这个匿名函数是立即执行函数(IIFE)。 每一次循环创建一个私有词法环境，执行时把当前的循环的i传入，保存在这个词法环境中。遍历完成后，js不会释放这块内存，所以能够正确的输出索引。
---

- for循环 + var + 闭包
```javascript

for (var i = 0; i < 3; i++) {
  var func = function() {
    var j = i;
    return function () {
      setTimeout(() => {
        console.log('i', j);
      }, 10);
    }
  }
  func()();
} 
// i 0
// i 1
// i 2

<!-- 或者 -->

for (var i = 0; i < 3; i++) {
  (function() {
    var j = i;
    setTimeout(() => {
      console.log('i', j);
    }, 10);
  })();
}
// i 0
// i 1
// i 2
```
**解析**： 

> 每次遍历操作中，定时器中函数都会用到父级的作用域的变量j，每次遍历都会形成一个闭包，不会释放变量j，所以每次能正确输出索引号。
---


- for循环 + let
```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log('i', i);
  }, 10);
}
// i 0
// i 1
// i 2
<!-- 或者 -->
for (var i = 0; i < 3; i++) {
  let j = i;
  setTimeout(() => {
    console.log('i', j);
  }, 10);
}
// i 0
// i 1
// i 2
```
**解析**：

>let 是es6的一种新的变量声明方式，拥有块级作用域。上面代码中，变量i是let声明的，当前的i只在本轮循环有效，所以每一次循环的i其实都是一个新的变量，所以输出的是正确的索引。

---



- for...of 和 for...in
```javascript
for (var i in [0,1,2]) {
  (function(i) {
  setTimeout(() => {
    console.log('i', i);
  }, 10);
  })(i);
}
<!-- 或者 -->
for (let i in [0,1,2]) {
  setTimeout(() => {
    console.log('i', i);
  }, 10);
}
// i 0
// i 1
// i 2
```
**解析**：

>for...of 是es6中的一种遍历数组方式，for...in 大多数是遍历对象；在循环遍历中异步操作效果同for循环。

---


### 特殊遍历方式

- forEach、map、filter

```javascript
<!-- forEach遍历 -->
[0,1,2].forEach(i => {
  setTimeout(() => {
    console.log('i', i);
  }, 10);
});
// i 0
// i 1
// i 2

<!-- map遍历 -->
[0,1,2].map(i => {
  setTimeout(() => {
    console.log('i', i);
  }, 10);
});
// [undefined, undefined, undefined]  -- 每次遍历都返回
// i 0
// i 1
// i 2

<!-- filter遍历 -->
[0,1,2].filter(i => {
  setTimeout(() => {
    console.log('i', i);
  }, 10);
});
// []  -- 每次遍历为真时返回
// i 0
// i 1
// i 2
```


**解析**：

>这三个特殊遍历方式, 变量i的作用类似于let i。每次循环都有自己作用域，所以能够输出正确的索引。


