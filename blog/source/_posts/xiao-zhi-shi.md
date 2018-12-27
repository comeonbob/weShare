---
title: 学习webpack前，可以了解的小知识点
categories: Xiaobu
tags: webpack
date: "2018-12-27"
---

阅读前：文章大概是写，简单用过webpack,想继续深入了解webpack前需要了解的知识。但文章内容跟webpack使用关系并不大。

文章概要：

1. Object.defineProperty
2. call 和apply
3. 模块化规范
4. webpack的小点
5. 小结

##  1. Object.defineProperty

![](/img/xiaozhishi/1.jpg)

属性：**数据属性（data property）**和**存取器属性（accessor property）,**与属性相关联的值是**属性特性。**

### **1.1属性的特性**

数据属性（data property）的特性：value，writable，enumerable，configurable。 

存取器属性\(accessor property\)的特性： 取\(get\), 写入（set），enumerable，configurable。 ****

测试一下这两种属性的输出：

```javascript
var testProperty = {
    dataProperty: "I am data property",
    get accessorProperty () { //  getter 方法定义
        return "I am accessor property"
    },
    set accessorProperty (varue) { //  setter 方法定义
        console.log("set accessorProperty")
    }
}
```

 Chrome 控制台输出如下图：

![](/img/xiaozhishi/2.png)

**1.2属性特性的使用**

有意思的是（假设属性是可读/写的，既有getter 方法，又有setter 方法）属性进行读写的时候，会触发定义的getter 方法和setter 方法

![](/img/xiaozhishi/3.jpg)

**那么在存取器属性，读写之间可以做的事情就很多了**

eg.读 get

```javascript
var getter = module && module.__esModule ? function getDefault() {
    return module['default'];
} : function getModuleExports() {
    return module;
};

// exports 假设 是一个已知 对象 那么此处定义的就是 exports.name 属性的特性， exports.name 的值依赖于getter
Object.defineProperty(exports, name, {
    configurable: false,
    enumerable: true,
    get: getter
});
```

eg.写set

```javascript
<div id="app">
   <input type="text" id ="uName" />
   <span id="userName"></span>
</div>
<script type="text/javascript">
var obj = {}
Object.defineProperty(obj, "test", {
    set: function(val) {
        document.getElementById("userName").innerText = val;
    }
});
document
.getElementById("uName")
.addEventListener("keyup", function(event) {
    obj.test = event.target.value;
});
</script>
```

##  2.call 和apply

函数的调用方式有4种

![](/img/xiaozhishi/call.jpg)

我们了解一下第四种

> 摘抄至JavaScript权威指南  **call\(\) 和apply\(\)的第一个参数是要调用函数的母体对象，它是调用上下文，在函数体内通过this来获得对它的引用。**

就是说，call\(\)和apply\(\)方法**显示指定**调用函数所需要的this值。（看起来就像，对象想用某个函数方法，但是这个对象又不想实现这个函数方法）

**语法：**

**fun.call\(thisArg, arg1, arg2, ...\)**

**func.apply\(thisArg, \[argsArray\]\)**

eg.

![](/img/xiaozhishi/haha.jpg)

**2.1 call\(\)和apply\(\) 应用小例子**  
apply ：[ 参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)

```javascript
Math.max(10, 20);   //  20
var arr = [1, 2, 3];
Math.max.apply(null, arr);

// arr.push(element1, ..., elementN) Array.prototype.push()语法
var arr1 = ["1","2","3"]
var arr2 = ["4","5","6"];
//concat 也能实现，但它实际上并不附加到现有数组，而是创建并返回一个新数组。
// 参数数组不能太大，会有超出JavaScript引擎的参数长度限制的风险
arr1.push.apply(arr1,arr2);    //得到合并后数组的长度，因为push就是返回一个数组的长度
```

call: [参考](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call)

```javascript
(function(modules) {
  // The module cache 模块是否加载过
  var installedModules = {};
  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    // Create a new module (and put it into the cache)
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    // Execute the module function
    // 拿到对应的模块modules[moduleId] 这是一个函数。
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    // Flag the module as loaded
    module.l = true;
    return module.exports;
  }
  return __webpack_require__(__webpack_require__.s = 1);
})([
  /* 0 */
  function(module, exports) {
    module.exports = "Hello World";
  },
  /* 1 */
  function(module, exports, __webpack_require__) {
    module.exports = __webpack_require__(0);
  }
]);
```

##  3.模块化规范

![](/img/xiaozhishi/mo.jpg)

内容太多～～ 下篇填坑。

但知道模块化还是很重要的，比如 \(皮一下,知道规范方便写代码和读代码\)

```javascript
function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Vue = factory());
}
```

##  4.webpack的小点

### **4.1** webpack的几个思考

  webpack是什么？

> At its core, webpack is a static module bundler for modern JavaScript applications. When webpack processes your application, it internally builds a dependency graph which maps every module your project needs and generates one or more bundles.

  webpack解决什么问题（看4.2）？

  webpack怎么用？

  webpack深入探索？

### **4.2**简述webpack的版本更新

**Webpack V1**

* 编译、打包
* HMR \(模块热更新\)
* 代码分割
* 文件处理

**Webpack V2**

* Tree Shaking
* ES module（函数） 
* 动态 Import

**Webpack V3**

* Scope Hoisting \(作用域提升\)
* Magic Comments （配合动态import使用）

**Webpack V4**

* 简化打包
* 插件系统优化
* webpack4支持模块类型增加：

        javascript/auto: 在webpack3里，默认开启对所有模块系统的支持，包括CommonJS、AMD、ESM。  
        javascript/esm: 只支持ESM这种静态模块。  
        javascript/dynamic: 只支持CommonJS和AMD这种动态模块。  
        json: 只支持JSON数据，可以通过require和import来使用。  
        webassembly/experimental: 只支持wasm模块，目前处于试验阶段 

### **4.3   4个核心概念**

![](/img/xiaozhishi/webpack.jpg)

**entry：** 打包的入口，单个或多个

**output:** 打包成的文件\(bundle\),一个或多个,配合CDN

**Loaders:** 处理文件,转化为模块

**Plugins:** 代码分割,参与打包整个过程 ,打包优化和压缩,配置编译时的变量

##  5.小结

  文中例子比较粗糙，理解不准确之处，还请教正。关于学习webpack前，可以了解的小知识点，也只是我自己在这个 阶段了解过的点，还有很多重要的点并未提及，要真的去理解webpack，还需多看[文档](https://webpack.js.org/concepts/)，代码实践。

  撒花～～ 结束

