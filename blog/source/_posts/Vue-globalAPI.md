---
title: Vue生命周期
categories: Emfan
tags: Vue
date: 2020-05-01
---

### Vue源码解析--全局API

#### 一、调用方式：

1.使用Vue对象上暴露的方法及属性，例：Vue.nextTick，Vue.set, Vue.delete

2.使用Vue实例上挂载的方法及属性，例：`vm.$nextTick`, `vm.$set`, `vm.$delete`

#### 二、源码分析：
global-api/index.js -- 全局API入口文件

```javascript
/* @flow */
// 从各个模块导入功能函数
import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

// 导入辅助函数
import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

// 导出initGlobalAPI函数
export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  // 定义全局配置对象
  const configDef = {}
  // 为配置对象设置取值器函数
  configDef.get = () => config
  // 不允许修改配置对象，非生产环境会给出警告
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  
  // Object.defineProperty属性描述符，configurable，enumerable，writable默认false
  // 定义Vue对象上的静态属性config
  Object.defineProperty(Vue, 'config', configDef)

  // 定义util工具函数
  // exposed util methods.
  // 注意：这些不是公共API的一部分-避免依赖
  // 除非你了解使用他们所带来的风险
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  
  // 定义Vue的静态方法set、delete、nextTick
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick
  
  // v2.6版本明确的API
  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }
  
  // 初始化Vue.options属性为空对象
  Vue.options = Object.create(null)
  // 初始化options属性的各个子属性为空对象
  // ASSET_TYPES是常量数组，为了在此动态添加属性
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })
 
  // 这用于标识“基础”构造函数
  // 以在Weex的多实例场景中扩展所有普通对象组件
  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue
  
  // 扩展options.components属性，加入内建组件
  extend(Vue.options.components, builtInComponents)
  
  // 向Vue对象上挂载静态方法
  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}

```

#### 三、入口文件分析：
总体来讲，分为两大块：

#### 定义静态属性

- config：Vue的静态属性 config，这是全局配置对象。

- options：定义的 options 对象是非常重要的属性，存放初始化的数据，我们平时在创建Vue实例时传入的配置对象最终要与这份配置属性合并，在实例初始化函数中的合并配置对象一部分可以初窥端倪。

#### 定义静态方法

- util：虽然暴露了一些辅助方法，但官方并不将它们列入公共API中，不鼓励外部使用。
- set：设置响应式对象的响应式属性，强制触发视图更新，在数组更新中非常实用，不适用于根数据属性。
- delete：删除响应式属性强制触发视图更新， 使用情境较少。
- nextTick：DOM更新后的执行回调，常用于需要等待DOM更新或加载完成后执行的后续功能。
- use：安装插件，自带规避重复安装。
- mixin：全局注册混入插件功能，官方不推荐在应用代码中使用。
- extend：创建基于Vue的子类并扩展初始内容。
- directive：注册全局指令。
- component：注册全局组件。
- filter：注册全局过滤器。
- observable：v2.6增加的API，作用是让一个对象可响应，Vue 内部会用它来处理 data 函数返回的对象。

参考文章：
- https://www.cnblogs.com/lalalagq/p/10114295.html
- https://blog.csdn.net/u012562411/article/details/100729064

