---
title: Vue双向数据绑定
categories: Little
tags: Vue
date: "2020-03-30"
---

## 双向数据绑定

### 1.vue双向数据绑定原理：

#### （1）通过DOM事件监听实现数据更新。

#### （2）通过Object.defineProperty()实现数据劫持，采用发布/订阅者模式，在get()时添加依赖，在编译时调用get()，在set()时发布依赖实现Dom更新。

<!--more-->

### 2.实现：

#### (1)实现一个Vue初始化，包含数据劫持和编译器.

**class Vue**

```javascript
class Vue {
  constructor(options) {
    this.initVue(options);
  }

  initVue(options) {
    this.$options = options;
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$methods = options.methods;
    observer(this.$data); // 数据劫持
    complie(this, this.$el); // 编译器
  }
}
```

**index.html**

```javascript
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>简易双向数据绑定</title>
</head>

<body>
  <div id="app">
    <form>
      <input type="text" v-model="value" />
      <button type="button" v-click="add">Add</button>
    </form>
    <p v-text="value" />
  </div>
  <script src="./dep.js"></script>
  <script src="./observer.js"></script>
  <script src="./watcher.js"></script>
  <script src="./complie.js"></script>
  <script src="./vue.js"></script>
  <script>
    window.onload = function () {
      new Vue({
        el: '#app',
        data: {
          value: 10
        },
        methods: {
          add() {
            this.value++
          }
        }
      })
    }
  </script>
</body>

</html>
```

#### (2)实现一个编译器complie.

```javascript
class Complie {
  constructor(vm, root) {
    this.vm = vm;
    this.init(root);
  }

  init(root) {
    const vm = this.vm;
    const that = this;
    const nodes = root.children;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.length) {
        complie(vm, node);
      }

      if (node.hasAttribute('v-click')) {
        node.onclick = (function () {
          const attrVal = node.getAttribute('v-click');
          return vm.$methods[attrVal].bind(vm.$data);
        })();
      }

      if (node.hasAttribute('v-model') && (node.tagName == 'INPUT' || node.tagName == 'TEXT')) {
        node.addEventListener('input', (function () {
          const attrVal = node.getAttribute('v-model');
          that.updateDom(node, 'value')(vm.$data[attrVal], '');

          return function (e) {
            vm.$data[attrVal] = e.target.value;
          }
        })());
      }

      if (node.hasAttribute('v-text')) {
        const attrVal = node.getAttribute('v-text');
        that.updateDom(node, 'textContent')(vm.$data[attrVal], '');
      }
    }
  }

  updateDom(node, attr) {
    return function (value, oldValue) {
      if (value === oldValue) {
        return;
      }
      node[attr] = value;
    }
  }

}

function complie(vm, root) {
  return new Complie(vm, root);
}
```

#### **(3)实现数据劫持observer.**

```javascript
class Observer {
  constructor(value) {
    this.value = value;
    this.walk(value);
  }

  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
}

function defineReactive(obj, key, val) {
  if (arguments.length === 2) {
    val = obj[key];
  }
  if (typeof val === 'object') {
    observer(val);
  }
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      return val;
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      val = newVal;
    }
  })
}

function observer(value) {
  return new Observer(value);
}
```

#### **(4)实现依赖类Dep.**

```javascript
class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  depend() {
    if (window.target) {
      this.addSub(window.target);
    }
  }

  notify() {
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}
function dep() {
  return new Dep();
}
```

#### **(5)在observer实现发布/订阅者者模式.**

```javascript
class Observer {
  constructor(value) {
    this.value = value;
    this.walk(value);
  }

  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
}

function defineReactive(obj, key, val) {
  if (arguments.length === 2) {
    val = obj[key];
  }
  if (typeof val === 'object') {
    observer(val);
  }
  // 实例化依赖类
  const depInstance = dep()
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 添加依赖
      depInstance.depend();
      return val;
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      val = newVal;
      // 发布依赖
      depInstance.notify();
    }
  })
}

function observer(value) {
  return new Observer(value);
}
```

#### **(6)实现一个Watch类.**

```javascript
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.cb = cb;
    this.getter = parsePath(expOrFn);
    window.target = this;
    this.value = this.get();
  }
  get() {
    const vm = this.vm;
    let value = this.getter.call(vm, vm.$data);
    window.target = undefined;
    return value;
  }
  update() {
    const oldValue = this.value;
    window.target = undefined;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }
}

const bailRE = /[^\w.$]/
function parsePath(path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]];
    }
    return obj;
  }
}
```

#### **(7)在编译时调用Watch实例.**

```javascript
class Complie {
  constructor(vm, root) {
    this.vm = vm;
    this.init(root);
  }

  init(root) {
    const vm = this.vm;
    const that = this;
    const nodes = root.children;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.length) {
        complie(vm, node);
      }

      if (node.hasAttribute('v-click')) {
        node.onclick = (function () {
          const attrVal = node.getAttribute('v-click');
          return vm.$methods[attrVal].bind(vm.$data);
        })();
      }

      if (node.hasAttribute('v-model') && (node.tagName == 'INPUT' || node.tagName == 'TEXT')) {
        node.addEventListener('input', (function () {
          const attrVal = node.getAttribute('v-model');
          that.updateDom(node, 'value')(vm.$data[attrVal], '');
          // 添加Watch实例
          new Watcher(
            vm,
            attrVal,
            that.updateDom(node, 'value')
          )

          return function (e) {
            vm.$data[attrVal] = e.target.value;
          }
        })());
      }

      if (node.hasAttribute('v-text')) {
        const attrVal = node.getAttribute('v-text');
        that.updateDom(node, 'textContent')(vm.$data[attrVal], '');
        // 添加Watch实例
        new Watcher(
          vm,
          attrVal,
          that.updateDom(node, 'textContent')
        )
      }
    }
  }

  updateDom(node, attr) {
    return function (value, oldValue) {
      if (value === oldValue) {
        return;
      }
      node[attr] = value;
    }
  }

}

function complie(vm, root) {
  return new Complie(vm, root);
}
```

#### **(8)改进：**

**es6新增proxy类可以直接劫持整个对象.**

```
function proxyReactive (vm, obj) {
  const depInstance = dep();
  vm.$proxy.data = new Proxy(obj, {
    get (target, propKey, receiver) {
      depInstance.depend();
      return Reflect.get(target, propKey, receiver);
    },
    set (target, propKey, value, receiver) {
      const newValue = Reflect.set(target, propKey, value, receiver);
      depInstance.notify();
      return newValue;
    }
  })
}
```

## [参考vue源码](https://github.com/TingYuLC/bindingData)
