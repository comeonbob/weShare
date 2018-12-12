---
title: vueRouter
categories: Dawn
tags: VUE
date: "2018-12-12"
---

### 应用场景： 单页面富应用
**原理： 每次GET或者POST等请求在服务端有一个专门的正则配置列表，然后匹配到具体路径后，分发到不同的Controller,进行各种操作，将html返回给前端。**
通过监听 popstate 和 hashchange事件，来探测路由变化


## 对比:  
后端路由：页面可以在服务端渲染后直接返回给浏览器，不用等待前端加载任何js和css。前端开发者需要安装整套后端服务，必要时还得学习后端语言。html、数据、逻辑容易混为一谈


前端路由： 前后端分离，后端专注数据，前端专注交互和可视化。需要花费时间在加载js和css上

### vue-router基本使用

1. routes配置  
resolve => require([path], resolve)的写法是为了懒加载  
```javascript
const Routes = [
  {
    path: '/index',
    component: (resolve) => require(['./views/index.vue'], resolve)
  },
  {
    path: '/about',
    component: (resolve) => require(['./views/about.vue'],resolve)
  }
]
```

2. routerConfig
``` javascript
const RouterConfig = {
  //optional mode  history,abstract,hash
  mode: 'history',
  routes: Routes 
}
```

3 router实例化
``` javascript
const router = new VueRouter(RouterConfig)
可以通过router.addRoutes(routes)来添加routes
```

4 在vue中注册
``` javascript
new Vue({
el: '#app',
router,
render: h => h(App)   // h means createElement
})
```

5 app.vue里添加
```javascript
  <router-view></router-view>
```


6 跳转方式
```javascript
<router-link to="path"></router-link>
```

## 源码分析

Vue-router是Evan开发的官方组件，是Vue全家桶的重要一员。Vue的组件必须要有install方法，在Vue.use()的时候来进行调用。通常格式如下

```javascript
MyPlugin.install = function (vue, optios) {
Vue.component('component-name', {
})
// 实例方法， 通常加$
Vue.prototype.$Notice =  function() {}
// 添加全局属或方法
Vue.globalMethod = function(){}
//添加全局混合
Vue.mixin({
mounted: function() {}
})
}
```

下面是Vue-router的install方法的具体内容
```javascript
export function install (Vue) {
  // 防止重复安装
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () {
        if (isDef(this.$options.router)) {
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })
  // 设置_router可以get, 无法set. (只会set $router 和 $route，无法set _router 和 _route)
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  //注册组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```


### VueRouter构造函数
```javascript
var VueRouter = function VueRouter (options) {
  if ( options === void 0 ) options = {};

  this.app = null;
  this.apps = [];
  this.options = options;
  this.beforeHooks = [];
  this.resolveHooks = [];
  this.afterHooks = [];
  this.matcher = createMatcher(options.routes || [], this);

  var mode = options.mode || 'hash';
  this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false;
  if (this.fallback) {
    mode = 'hash';
  }
  if (!inBrowser) {
    mode = 'abstract';
  }
  this.mode = mode;

  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base);
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback);
      break
    case 'abstract':
      this.history = new AbstractHistory(this, options.base);
      break
    default:
      if (process.env.NODE_ENV !== 'production') {
        assert(false, ("invalid mode: " + mode));
      }
  }
};

```
1. history,vue-router的关键配置，决定vue-router的路由跳转方式  
HashHistory, HTML5History, AbstractHistory继承自History.  
History中核心的方法： transitionTo()  , confirmTransition()中运行runQueue()
HashHistory通过监听hashChange事件来进行跳转  
HTML5History通过监听popstate  
AbstractHistory运用非浏览器的情况下（例如移动端）  
default: hashHistory
HTML5History 可以不用写#
2. createMatcher，进行路由匹配，匹配成功调用_createRoute,建立路由对象，进行跳转.
router.match实际上就是封装在createMatcher产生的对象中的暴露方法。


```javascript
History.prototype.transitionTo = function transitionTo (location, onComplete, onAbort) {
    var this$1 = this;

  var route = this.router.match(location, this.current);
  this.confirmTransition(route, function () {
    this$1.updateRoute(route);
    onComplete && onComplete(route);
    this$1.ensureURL();

    // fire ready cbs once
    if (!this$1.ready) {
      this$1.ready = true;
      this$1.readyCbs.forEach(function (cb) { cb(route); });
    }
  }, function (err) {
    if (onAbort) {
      onAbort(err);
    }
    if (err && !this$1.ready) {
      this$1.ready = true;
      this$1.readyErrorCbs.forEach(function (cb) { cb(err); });
    }
  });
};
```
## 两个组件

<router-view>,<router-link>两个组件都是在src/components/中定义的，  
并在install函数里进行了注册

router-link的 props
1. tag属性，可以把router-link渲染成其他的标签
```javascript
 if (this.tag === 'a') {
      data.on = on
      data.attrs = { href }
    } else {
      // find the first <a> child and apply listener and href
      const a = findAnchor(this.$slots.default)
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false
        const aData = a.data = extend({}, a.data)
        aData.on = on
        const aAttrs = a.data.attrs = extend({}, a.data.attrs)
        aAttrs.href = href
      } else {
        // doesn't have <a> child, apply listener to self
        data.on = on
      }
    }

    return h(this.tag, data, this.$slots.default)
```
h是 createElement方法，用于创建element

route-link的注册attr
+replace
+active-class



### router的实例方法
+ this.router.push()
+ this.router.replace()
+ this.router.go()  
replace不留下记录，go类似window.history.go()，在history中记录向前或者向后多少步
```javascript
  //在 class VueRouter中的方法
  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.push(location, onComplete, onAbort)
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    this.history.replace(location, onComplete, onAbort)
  }

  go (n: number) {
    this.history.go(n)
  }
```

### beforeEach
// 设置title功能
```javascript
router.beforeEach((to, from, next) => {
window.document.title = to.meta.title
next()
})
// to 即将要进入的目标对象路由
// from 当前导航即将要离开的路有对象
// next 调用该方法后进入下一个钩子

router.beforeEach((to, from, next) => {
if(window.localStorage.getItem('token')){
next();
} else {
next('/login');
}
})
```

源码里的实现
```javascript
  beforeEach (fn: Function): Function {
    return registerHook(this.beforeHooks, fn)
  }

  beforeResolve (fn: Function): Function {
    return registerHook(this.resolveHooks, fn)
  }

  afterEach (fn: Function): Function {
    return registerHook(this.afterHooks, fn)
  }

  function registerHook (list: Array<any>, fn: Function): Function {
  list.push(fn)
  return () => {
    const i = list.indexOf(fn)
    if (i > -1) list.splice(i, 1)
  }
}
```

### watch route  
当页面路由从user/foo到user/bar的时候。相同的组件会被重用，（这样提高了效率）。随之而来的是生命周期钩子不会被调用（mounted, created）。这个时候可以通过watch route来进行更新
```javascript
const User = {
  template: '...',
  watch: {
    '$route' (to, from) {}
  }
}

const User = {
  template: '...',
  beforeRouteUpdate (to, from, next) {
  // react to route changes...
  // don't forget to call next()   如果忘记了，抱歉页面就卡住了
  }
}
```

### 通配符 \*
{
path: '\*'
}
{
path: '/user-\*'
}
\* 通配符代表任意个任意字符
this.$router.push('/user-admin')
this.$route.params.pathMatch  // 'admin'

this.$router.push('/non-existing')
this.$route.params.pathMatch // 'non-existing'
当使用\*的时候，params会被自动加入一个pathMatch属性，这个属性会存储\*代表的字符串

### 传值

### Boolean mode
```javascript
// when props is set to true, the route.params will be set as the component props
const router = new VueRouter({
  routes: [
    { path: '/user/:id', component: User, props: true },
    {
      path: '/user/:id',
      components: {default: User, sidebar: Siderbar },
      props: { default: true, sidebar: false }
    }
  ]
})
```

### Object mode
```javascript
// when props is an object, this will be set as the component props as-is. Useful for when the
// props are static
const router = new VueRouter({
  routes: [
    { path:  '/promption/from-newsletter', component: Promption, 
      props: { newsletterPopup: false}
    }
  ]
})
```

### FunctionMode
``` javascript
// create a function that return props. allows you to cast parameters into other types
const router = new VueRouter({
  routes: [
    { path: '/search', component: SearchUser, props: (route) => ({ query: route.query.q })}
  ]
})
```
```javascript
function resolveProps (route, config) {
  switch (typeof config) {
    case 'undefined':
      return
    case 'object':
      return config
    case 'function':
      return config(route)
    case 'boolean':
      return config ? route.params : undefined
    default:
      if (process.env.NODE_ENV !== 'production') {
        warn(
          false,
          `props in "${route.path}" is a ${typeof config}, ` +
          `expecting an object, function or boolean.`
        )
      }
  }
}


// View component中进行props传值。 如果component中没有该props，则存储在attr中
 var propsToPass = data.props = resolveProps(route, matched.props && matched.props[name]);
    if (propsToPass) {
      // clone to prevent mutation
      propsToPass = data.props = extend({}, propsToPass);
      // pass non-declared props as attrs
      var attrs = data.attrs = data.attrs || {};
      for (var key in propsToPass) {
        if (!component.props || !(key in component.props)) {
          attrs[key] = propsToPass[key];
          delete propsToPass[key];
        }
      }
    }
  
```

## 路由原理
location改变路由跳转
1. 监听事件changeHash popstate
2. 触发监听事件，createMather.match进行匹配，匹配成功creatRoute
3. transitionTo进行跳转，confirmTransition判断是否跳转成功
4. 执行相关钩子函数，进行render，执行router-vue的相关render，包括子组件渲染，具名slot等渲染我们需要展示的组件

调用API路由跳转
go push replace三个路由跳转方法，通过调用mode对应的history的相关方法，触发transitionTo


```javascript
VueRouter.prototype.onReady = function onReady (cb, errorCb) {
  this.history.onReady(cb, errorCb);
};

VueRouter.prototype.onError = function onError (errorCb) {
  this.history.onError(errorCb);
};

VueRouter.prototype.push = function push (location, onComplete, onAbort) {
  this.history.push(location, onComplete, onAbort);
};

VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
  this.history.replace(location, onComplete, onAbort);
};

VueRouter.prototype.go = function go (n) {
  this.history.go(n);
};
```

几个概念
1.history 决定路由跳转方式的对象
2.match 进行匹配，匹配成功生成route
3.route 形成路由，带有当前页面的路由信息
4.record 配置路由时候的路由map，会被保存为一个一个的record，分别存在pathMap,pathList,nameMap用于进行匹配
5.钩子  在confirmTransition中插入钩子，通过一个matched对象
