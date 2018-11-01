---
title: 腾讯2018面试题解析
categories: Ring
tags: JS
date: "2018-06-28"
---


### 腾讯2018年的一道笔试题（涉及到作用域）
<!--more-->
****
 一：请问下面输出什么值
```javascript
console.log(a)

    var a = 1;

    console.log(a)

    function a() {
      console.log(2);
    }

    console.log(a)

    var a = 3;

    console.log(a)

    function a() {
      console.log(4)
    }

    console.log(a)

    a();
```

### 什么是作用域?

> 通常来说一段程序代码中使用的变量和函数并不总是可用的，限定其可用性的范围即作用域，作用域的使用提高了程序逻辑的局部性，增强程序的可靠性，减少名字冲突   - - 百度百科

我自己的理解：浏览器执行js代码的过程
两大问题：

#### （1）浏览器什么时候会进入作用域链？
 - 当看到script标签的时候
 - 当调用一个方法的时候

#### （2）进入作用域之后，发生了什么事情？
 - JS预解析（为执行做准备）

    1. 开辟一个空间
    2. 找代码里面有没有var，有没有方法参数，有没有方法的声明，如果有var，有方法参数，就会把var和方法参数声明的变量，赋值成undefined存到空间里面，如果有function，就会把function所有的内容存到空间里面

 - JS逐行执行
 
     找有没有表达式， +-*/=....

![](/img/ring1.jpg)

****
 通过上面的理论，请做下面三道题
```javascript
    var a = 1;

    function fn1() {
      console.log(a)
      var a = 2;
    }

    fn1()
    console.log(a)
```

```javascript
    var a = 1;

    function fn1() {
      console.log(a)
      a = 2;
    }

    fn1()
    console.log(a)
```

```javascript
    var a = 1;

    function fn1(a) {
      console.log(a)
      a = 2;
    }

    fn1()
    console.log(a)
```

### 作用域链？

> 作用域链决定了哪些数据能被函数访问。当一个函数创建后，它的作用域链会被创建此函数的作用域中可访问的数据对象填充。   - - 百度百科

*tip:里面的修改，外面改，外面改，里面也改*


### 以上代码结果
```javascript
    function a() {
      console.log(4)
    }

    1
    1
    3
    3
```
```javascript
    undefined
    1
```
```javascript
    1
    2
```
```javascript
    undefined
    1
```