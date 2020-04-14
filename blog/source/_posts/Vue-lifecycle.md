---
title: Vue生命周期
categories: ZhiQiang
tags: Vue
date: 2020-03-30 20:36:10
---

&emsp;&emsp;框架为什么要有生命周期？因为框架就像是组装好的电脑，每个人的电脑里软件都不一样，买来了电脑，需要让用户可以有办法自己装一些软件。也就是实际业务不同，你要借助框架去做一些事，所以需要框架给一些接口让外部业务去调用，去填充数据。从new Vue()开始，这个框架的生命周期(作为一个构造函数函数)就已经开始了，但是我们平时使用的是它在一些特定的时刻的抛出的接口，这个才是定义的生命周期。

# Vue构造函数

&emsp;&emsp;这里学习的源码版本是2.6.11，构造函数的定义在src\core\instance\index.js。源码中Vue的构造函数很简单，首先检测是不是作为构造函数使用，然后执行初始化 this._init(options)

```js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue) ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```

# _init

初始化方法是在上面的initMixin中定义的，位置是在src\core\instance\init.js中

```js
Vue.prototype._init = function (options) {
  var vm = this;
  // a uid
  vm._uid = uid$2++;
  var startTag, endTag;
  /* istanbul ignore if */
  if ( config.performance && mark) { // 性能监控
    startTag = "vue-perf-start:" + (vm._uid);
    endTag = "vue-perf-end:" + (vm._uid);
    mark(startTag);
  }
  // a flag to avoid this being observed
  vm._isVue = true;
  // merge options
  if (options && options._isComponent) { // 优化内部组件实例
    initInternalComponent(vm, options); // 初始化内部组件
  } else {
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    );
  }
  /* istanbul ignore else */
  {
    initProxy(vm);
  }
  // expose real self
  vm._self = vm;
  initLifecycle(vm);
  initEvents(vm);
  initRender(vm);
  callHook(vm, 'beforeCreate');
  initInjections(vm); // resolve injections before data/props
  initState(vm);
  initProvide(vm); // resolve provide after data/props
  callHook(vm, 'created');
  /* istanbul ignore if */
  if ( config.performance && mark) { // 性能监控
    vm._name = formatComponentName(vm, false);
    mark(endTag);
    measure(("vue " + (vm._name) + " init"), startTag, endTag);
  }

  if (vm.$options.el) { // 开始挂载
    vm.$mount(vm.$options.el);
  }
}
```

它的作用是定义vm、uid，合并所有配置，执行生命周期系统、事件系统、渲染系统、数据系统的初始化，最后检测传入的挂载节点无误后执行挂载。其中mergeOptions的作用是合并当前构造函数(新建的Vue的实例)的options和其父级构造函数(Vue)的options属性，Vue自身的配置里包含了自带的组件，指令等，如<transition>。其中会执行对props、Inject、全局指令进行标准化的方法：normalizeProps(child, vm);normalizeInject(child, vm)，normalizeDirectives(child)，props里的类型检测就是在这进行的，另外会合并minxins里的options，具体实现暂且不谈。我们一个一个来看：

## initProxy

```js
var hasProxy = typeof Proxy !== 'undefined' && isNative(Proxy); // isNative检测是否JS原生方法
initProxy = function initProxy (vm) {
  if (hasProxy) {
    // determine which proxy handler to use
    var options = vm.$options;
    var handlers = options.render && options.render._withStripped
      ? getHandler
      : hasHandler;
    vm._renderProxy = new Proxy(vm, handlers);
  } else {
    vm._renderProxy = vm;
  }
};
```

initProxy位置在src\core\instance\proxy.js，作用是新建一层代理，对传入的数据进行一次过滤，比如，不能在模板和data中使用以$、_开头的变量，因为这些是Vue的内部持有变量。处理逻辑在getHandler和hasHandler方法中。

## initlifecycle

```js
function initLifecycle (vm) {
  var options = vm.$options;
  // locate first non-abstract parent
  var parent = options.parent; // 找到第一个父级
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }
  // 根元素
  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;
  // 变量初始化
  vm.$children = [];
  vm.$refs = {};
  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}
```

这个方法在src\core\instance\lifecycle.js，主要是找到$root，并且初始化$parent、$refs、$children等属性

## initEvents

```js
function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}
```

位置是src\core\instance\events.js，initEvents作用是初始化Vue的事件系统的，在Vue实例上新增一个_events属性，并存储初始化的事件。updateComponentListeners的主要作用就是将父组件向子组件添加的事件注册到子组件实例中的_events对象里。

## initRender

```js
function initRender (vm) {
    vm._vnode = null;
    vm._staticTrees = null;
    var options = vm.$options;
    var parentVnode = vm.$vnode = options._parentVnode;
    var renderContext = parentVnode && parentVnode.context;
    vm.$slots = resolveSlots(options._renderChildren, renderContext); // 解析slots
    vm.$scopedSlots = emptyObject;
    vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
    vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); }; // $createElement是手写render方法时调用的，包含对输入数据的过滤
    var parentData = parentVnode && parentVnode.data;

    /* istanbul ignore else */
    {
      defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
        !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
      }, true);
      defineReactive(vm, '$listeners', options._parentListeners || emptyObject, function () {
        !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
      }, true);
    }
  }
```

initRender在src\core\instance\render.js。initRender方法主要是初始化渲染属性，定义渲染方法。并且初始化插槽、$attrs、$listeners，其中的defineReactive就是定义响应式系统的一部分内容。initRender之后会触发beforeCreate方法，这时methods、data等还没有初始化，所以没法调用其中的属性。

## initInjections和initProvide

初始化inject/provide

## initState

```js
function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.methods) { initMethods(vm, opts.methods); }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

initState的位置在src\core\instance\state.js，作用是初始化props、data、methods、watch、computed等属性。

1. initProps主要是将props设置成响应式数据；
2. initMethods主要是对命名进行检查——不能与props或data中的变量重名，然后将方法挂载到vm实例上。
3. initData也会进行重名检查，并调用observe方法将数据对象标记为响应式对象。
4. initComputed对computed属性进行检查，新建一个watchers空对象，再遍历传入的options.computed，每个属性新建一个Watcher实例，表示增加了一个需要被监听的数据依赖。
5. initWatch是初始化watch系统，初始化data、computed、watch最终都会调用Object.defineProperty进行数据拦截，它们都是响应式系统的一部分
6. initState之后触发created，这个时候数据已经加载完毕，但是还没有挂载，适合做一些与异步请求的业务

## 调用生命周期方法的方法callHook

```js
  function callHook (vm, hook) {
    // #7573 disable dep collection when invoking lifecycle hooks
    pushTarget();
    var handlers = vm.$options[hook];
    var info = hook + " hook";
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        invokeWithErrorHandling(handlers[i], vm, null, vm, info);
      }
    }
    if (vm._hasHookEvent) {
      vm.$emit('hook:' + hook);
    }
    popTarget();
  }
```

callHook在src\core\instance\lifecycle.js中，生命周期内的方法是由callHook调用的，也就是遍历生命周期方法的数组(合并mixins的属性时会创建数组)，顺序执行其中的钩子函数，其中的invokeWithErrorHandling会捕捉执行过程的错误

## 挂载$mount

src\platforms\weex\runtime\index.js

```js
Vue.prototype.$mount = function (el, hydrating) {
  el = el && inBrowser ? query(el) : undefined; // 获取挂载节点
  return mountComponent(this, el, hydrating)
};
```

```js
var mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (el, hydrating) {
  el = el && query(el);
  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) { // 不能挂载到html/body
     warn("Do not mount Vue to <html> or <body> - mount to normal elements instead.");
    return this
  }
  var options = this.$options;
  // resolve template/el and convert to render function
  if (!options.render) { // render是已经编译好的渲染方法，如果没有渲染方法，则需要获取用户传入的模板内容将模板字符串转化为渲染方法
    var template = options.template;
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
          /* istanbul ignore if */
          if ( !template) {
            warn(("Template element not found or is empty: " + (options.template)), this);
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        {
          warn('invalid template option:' + template, this);
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      if ( config.performance && mark) {
        mark('compile');
      }
      var ref = compileToFunctions(template, {
        outputSourceRange: "development" !== 'production',
        shouldDecodeNewlines: shouldDecodeNewlines,
        shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      options.render = render;
      options.staticRenderFns = staticRenderFns;
      /* istanbul ignore if */
      if ( config.performance && mark) { // 性能监控
        mark('compile end');
        measure(("vue " + (this._name) + " compile"), 'compile', 'compile end');
      }
    }
  }
  return mount.call(this, el, hydrating)
};
```

compileToFunctions的作用是将模板编译成渲染函数，该函数接收待编译的模板字符串和编译选项作为参数，返回一个对象，对象里面的render属性即是编译好的渲染函数，最后将渲染函数设置到$options上。

```js
// src\core\instance\lifecycle.js
function mountComponent (vm, el, hydrating) {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode; // 创建默认的渲染函数
    {
      /* istanbul ignore if */ // 检查挂载节点是否存在并输出开发环境警告信息
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        );
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        );
      }
    }
  }
  callHook(vm, 'beforeMount');
  var updateComponent;
  /* istanbul ignore if */
  if ( config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;
      var startTag = "vue-perf-start:" + id;
      var endTag = "vue-perf-end:" + id;
      mark(startTag);
      var vnode = vm._render();
      mark(endTag);
      measure(("vue " + name + " render"), startTag, endTag);
      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure(("vue " + name + " patch"), startTag, endTag);
    };
  } else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating); // _render是对VNODE的一些处理
    };
  }
  new Watcher(vm, updateComponent, noop, {
    before: function before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate');
      }
    }
  }, true /* isRenderWatcher */);
  hydrating = false;
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
}
```

```js
// src\core\observer\scheduler.js
function callUpdatedHooks (queue) {
  var i = queue.length;
  while (i--) {
    var watcher = queue[i];
    var vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}
```

beforeMount是在渲染函数完成之后触发。之后调用vm._render()方法将render函数转化为Virtual DOM，并最终通过vm._update()方法将Virtual DOM渲染为真实的DOM节点。同时，还会创建一个Watcher实例，并将定义好的updateComponent函数传入，开启对模板中数据（状态）的监控，之后就正式挂载到DOM上，并触发mounted。beforeUpdate和updated分别在数据变化之前和更新之后触发

# 销毁过程

```js
Vue.prototype.$destroy = function () {
  var vm = this;
  if (vm._isBeingDestroyed) {
    return
  }
  callHook(vm, 'beforeDestroy');
  vm._isBeingDestroyed = true;
  // remove self from parent
  var parent = vm.$parent;
  if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
    remove(parent.$children, vm);
  }
  // teardown watchers
  if (vm._watcher) {
    vm._watcher.teardown();
  }
  var i = vm._watchers.length;
  while (i--) {
    vm._watchers[i].teardown();
  }
  // remove reference from data ob
  // frozen object may not have observer.
  if (vm._data.__ob__) {
    vm._data.__ob__.vmCount--;
  }
  // call the last hook...
  vm._isDestroyed = true;
  // invoke destroy hooks on current rendered tree
  vm.__patch__(vm._vnode, null);
  // fire destroyed hook
  callHook(vm, 'destroyed');
  // turn off all instance listeners.
  vm.$off();
  // remove __vue__ reference
  if (vm.$el) {
    vm.$el.__vue__ = null;
  }
  // release circular reference (#6759)
  if (vm.$vnode) {
    vm.$vnode.parent = null;
  }
};
```

组件销毁时会调用原型上的$destroy方法，首先会检测是否有销毁过程正在进行，如果没有即触发beforeDestroy。如果组件需要卸载一些监听事件可以在这个生命周期进行：

```js
beforeDestroy () {
  this.$root.$off(this.$route.name + 'Back')
  this.$root.$off(this.$route.name + 'Next')
}
```

接着正式开始注销：首先从父组件移除自身，接着执行vm._watcher.teardown() 将实例自身从其他数据的依赖列表中删除，teardown方法的作用是从所有依赖向的Dep列表中将自己删除。然后移除实例内数据对其他数据的依赖。接下来移除实例内响应式数据的引用、给当前实例上添加_isDestroyed属性来表示当前实例已经被销毁，同时将实例的VNode树设置为null，触发destroyed并移除所有事件监听器，销毁完毕。