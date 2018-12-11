---
title: 讲讲观察vue观察者，订阅者
categories: Evel
tags: Vue
date: "2018-08-24"
---

### 1、什么叫做双向绑定
- **定义讲解**：
**宏观**：视图（view）更新导致模型（model）的更新，模型的更新导致视图的更新。
**微观**：如果我们有一个user对象和一个name属性,一旦我们赋了一个新值给user.name,在UI上就会显示新的姓名了。同样地，如果UI包含了一个输入用户姓名的输入框，输入一个新值就应该会使user对象的name属性做出相应的改变。

### 2、代码简单实现
```
    /*js*/
    Object.defineProperty(obj, "evel", {
      get: function() {
        console.log("get init");
      },
      set: function(val) {
        document.getElementById("userName").innerText = val;
      }
    });
    document
    .getElementById("uName")
    .addEventListener("keyup", function(event) {
      obj.evel = event.target.value;
    });
    /*html*/
      <input type="text" id ="uName" />
      <span id="userName"></span>
```
 
### 3、详细说说vue中的观察者，订阅者
（1）**循序渐进**
- 常规js代码:
```
let a = 5
let b =2
let res = 0
let target = null
target = function () {
  res = a * b
}
target()
```
- 更进一步
```
let a = 5
let b =2
let res = 0
let target = null
let subscribers = []
target = function () {
  res = a * b
}

// 存储
function depend () {
  subscribers.push(target)
}
// 执行
function exet () {
  subscribers.forEach(run => run())
}
console.log(res)
depend()
exet()
```

（2）**进一步封装使用class**
```
class Dep {
  constructor () {
    this.subscribers =[]
  }
  // 添加
  depend (target) {
    if (target && !this.subscribers.includes(target)) {
      this.subscribers.push(target)
    }
  }
  // 执行
  notify () {
    this.subscribers.forEach(sub => sub())
  }
}
// 让他运行起来
const dep = new Dep()
let a = 5
let b = 5
let res = 0
let target = () => {
  res = a * b
}
dep.depend(target)
target()
console.log(res)
b = 500
dep.notify()
console.log(res)
```

（3）**截止目前封装了创建需要监视更新的匿名函数的行为，现在需要一个观察者，订阅者自动执行**
- Object.defineProperty（）的引入，它允许我们为属性定义getter和setter函数
```
/*简单的理解getter,setter*/
let data = {price: 5, quantity: 2}
Object.defineProperty(data,'price',{
  get () {
    console.log('get fun')
  },
  set () {
    console.log('set fun')
  }
})
data.price      // 触发get
data.price =20 // 触发set
```
- 对象中的所有属性添加get、set
```
let data = {price: 5, quantity: 2}
Object.keys(data).forEach(key => {
  let internalValue = data[key]
  Object.defineProperty(data, key, {
    get () {
      console.log(`Getting ${key}: ${internalValue}`)
    },
    set (newVal) {
      console.log(`setting ${key} to: ${newVal}`)
    }
  })
})
data.price
data.price =20
```
（4）**我们希望在每一次改变对象数据price,或者quantity的时候，能自动计算出总价，类似于vue的computed**
```
let data = {price: 5, quantity: 2}
let target = null
class Dep {
  constructor () {
    this.subscribers =[]
  }
  // 添加
  depend (target) {
    if (target && !this.subscribers.includes(target)) {
      this.subscribers.push(target)
    }
  }
  // 执行
  notify () {
    this.subscribers.forEach(sub => sub())
  }
}
// 观察者
Object.keys(data).forEach(key => {
  let internalValue = data[key]
  const dep = new Dep()
  Object.defineProperty(data, key, {
    get () {
      dep.depend(target)
      return internalValue
    },
    set (newVal) {
       internalValue = newVal
       dep.notify()
    }
  })
})
// 订阅者
target = () => {
  data.total = data.price * data.quantity
}
target()
data.price = 33
data.total 
```
可以发现的是每一次手动改变data对象中的属性，target函数就会自动执行。