---
title: 事件代理与冒泡.js
categories: Evel
tags: JS
date: "2018-06-19"
---

## 前景介绍

html元素可以进行嵌套，通俗讲就是父子元素的关系。父子元素绑定事件也是项目中不可避免的，接下来就讲讲事件代理与冒泡，以及对他们的使用。
<!--more-->
### 1.现场还原:*写了一段简单的代码，实例展示父子元素关系，这段代码也是经常遇见的*

```
/*js:*/
arr = [
  {'name':'阿根廷',code:'a'},
  {'name':'墨西哥',code:'m'},
  {'name':'法国',code:'f'}
]

/*html:*/
<ul>
  <li v-for="(item,index) in arr" @click="willWin" v-text="item.name" :key="item.code"></li>
</ul>
最终大约生成：
<ul>
  <li @click="willWin">阿根廷</li>
  <li @click="willWin">墨西哥</li>
  <li @click="willWin">法国</li>
</ul>
```
这段代码本身是没有问题的，但是一个问题就是我们会给每个子元素li绑定一个willWin()函数，这是十分没有必要的。

### 2.那该怎么做？？
其实我们可以合理利用事件冒泡，使用事件代理（父元素代替子元素进行事件绑定，需要做的就是区分是那个子元素触发的事件），进行简单优化。
修改之后的代码是这样的：
```
  <ul @click="willWin">
    <li v-for="(item,index) in arr"  v-text="item.name" :key="item.code" :data-key='index'> 
    </li>
  </ul>
```
这样就可以在willWin方法中获得event事件对象，它记录了事件触发元素event.target，根据它我们就可以进行区分被点击的元素，这就是事件代理的机制。

### 3.拓展介绍 

currentTarget：事件注册对象（event.currentTarget）,指向事件注册的元素。


---
- Date :   2018-06-28
- Author : evel

