---
title: Vue源码解析--Virutal Dom
categories: Bob
tags: Vue
date: "2020-03-26"
---

## 1.Virtual Dom是什么

Virtual Dom, 又叫虚拟dom，本质是一个js对象，是用来描述一个dom节点信息。

例如，一个普通的dom节点：

```html
<div class="wrap">i am text</div>
```

它的virtual dom 是：

```javascript
const divVdom = {
    tag: 'div',
    attrs: {
        class: "wrap"
    },
    text: 'i am text',
    children: []
}
```

## 2.Virtual Dom 有什么用

在Vue中，是数据驱动视图的。更新数据后，需要更新视图,如果直接操作真实dom，是比较耗性能的，因为真实dom节点是比较复杂。

所以vue中是这样更新视图：当数据发生变化时，我们对比变化前后的虚拟`DOM`节点，通过`DOM-Diff`算法计算出需要更新的地方，然后去更新需要更新的视图。

总的来说，使用Virtual Dom的好处有：

- Virtual Dom较简单，真实Dom对象较复杂；
- 通过对比新旧Virtual Dom，找出差异，可以减少操作真实Dom频率；
- 操作虚拟Dom，不依赖浏览器，可以实现服务端渲染SSR；

## 3.Vritual Dom是如何实现的

前面提到Virtual Dom就是一个js对象，是通过VNode类实现。

```javascript
// 源码位置：src/core/vdom/vnode.js
export default class VNode {
  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag                                /*当前节点的标签名*/
    this.data = data        /*当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息*/
    this.children = children  /*当前节点的子节点，是一个数组*/
    this.text = text     /*当前节点的文本*/
    this.elm = elm       /*当前虚拟节点对应的真实dom节点*/
    this.ns = undefined            /*当前节点的名字空间*/
    this.context = context          /*当前组件节点对应的Vue实例*/
    this.fnContext = undefined       /*函数式组件对应的Vue实例*/
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key           /*节点的key属性，被当作节点的标志，用以优化*/
    this.componentOptions = componentOptions   /*组件的option选项*/
    this.componentInstance = undefined       /*当前节点对应的组件的实例*/
    this.parent = undefined           /*当前节点的父节点*/
    this.raw = false         /*简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false*/
    this.isStatic = false         /*静态节点标志*/
    this.isRootInsert = true      /*是否作为跟节点插入*/
    this.isComment = false             /*是否为注释节点*/
    this.isCloned = false           /*是否为克隆节点*/
    this.isOnce = false                /*是否有v-once指令*/
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  get child (): Component | void {
    return this.componentInstance
  }
}
```



VNode类型可以描述很多种类型的节点，根据实例化传入参数的不同，生成不同的节点，主要有以下几种类型：

- 注释节点
- 文本节点
- 元素节点
- 组件节点
- ...

例如，注释节点：

```javascript
const node = new VNode()
node.text = text
node.isComment = true
```



## 4.Dom-Diff 算法

### 4.1 Dom-Diff是什么

对比新旧两份Virtual Dom, 找出有差异的地方，这个过程就是Dom-Diff。

### 4.2 如何找出有差异的地方

我们通过前面知道，新旧两份Virtual Dom实质上就是两个VNode类实例化的js对象。如果找出两个js对象的差异，基本的思路是：

**以新的VNode对象为准，对比旧的VNode对象，找出不同的节点，然后更新对应的真实Dom节点。**

两个VNode对象的节点不同，对应三种更新情况：

- 新增节点：新的VNode中有，旧的VNode中没有；
- 删除节点：新的VNode中没有，旧的VNode中有；
- 更新节点：新的VNode中有，旧的VNode中也有，但是属性不一样；

### 4.3 如何更新子节点

当对比两个节点都是元素节点，且都有子节点时如何更新呢？

基本思路是，拿到新旧两个子节点数组，两层循环，逐个对比得到差异的节点进行更新。

```javascript
for (let i = 0, n = newChildren.length; i < n; i++) {
    const newChild = newChildren[i]
    for (let j = 0, m = oldChildren.length; j < m; j++) {
        const oldChild = oldChildren[j]
        if (newChild === oldChild) {
            // ...
        }
    }
}
```

以上对比新旧子节点，有四种情况：

- 创建子节点：newChildren中有，oldChildren中没有；
- 删除子节点：newChildren循环完后，oldChildren中还有没处理的；
- 移动子节点：都存在，但是顺序不一样；
- 更新子节点：都存在，顺序也相同，但是内容不相同；

### 4.4 如何优化子节点更新

上面提供，通过双层循环新旧子节点，从而找出差异的地方。这种循环算法复杂度较高，可以做优化。

新旧子节点比较，本质上是两个数组做比较。实际上，两份数组应该是有较多相同的节点，如果一个一个去循环对比，比较浪费。 我们考虑新旧两个数组的第一个和最后一个位置的对比，从两头开始对比，前后调换，往中间逐步对比，这样效率高一些。具体思路如下：

- 先把`newChildren`数组里的所有未处理子节点的第一个子节点和`oldChildren`数组里所有未处理子节点的第一个子节点做比对，如果相同，那就直接进入更新节点的操作；
- 如果不同，再把`newChildren`数组里所有未处理子节点的最后一个子节点和`oldChildren`数组里所有未处理子节点的最后一个子节点做比对，如果相同，那就直接进入更新节点的操作；
- 如果不同，再把`newChildren`数组里所有未处理子节点的最后一个子节点和`oldChildren`数组里所有未处理子节点的第一个子节点做比对，如果相同，那就直接进入更新节点的操作，更新完后再将`oldChildren`数组里的该节点移动到与`newChildren`数组里节点相同的位置；
- 如果不同，再把`newChildren`数组里所有未处理子节点的第一个子节点和`oldChildren`数组里所有未处理子节点的最后一个子节点做比对，如果相同，那就直接进入更新节点的操作，更新完后再将`oldChildren`数组里的该节点移动到与`newChildren`数组里节点相同的位置；
- 最后四种情况都试完如果还不同，那就按照之前循环的方式来查找节点。

**源码如下：**

```javascript
// 循环更新子节点
  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0               // oldChildren开始索引
    let oldEndIdx = oldCh.length - 1   // oldChildren结束索引
    let oldStartVnode = oldCh[0]        // oldChildren中所有未处理节点中的第一个
    let oldEndVnode = oldCh[oldEndIdx]   // oldChildren中所有未处理节点中的最后一个

    let newStartIdx = 0               // newChildren开始索引
    let newEndIdx = newCh.length - 1   // newChildren结束索引
    let newStartVnode = newCh[0]        // newChildren中所有未处理节点中的第一个
    let newEndVnode = newCh[newEndIdx]  // newChildren中所有未处理节点中的最后一个

    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly

    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(newCh)
    }

    // 以"新前"、"新后"、"旧前"、"旧后"的方式开始比对节点
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // 如果oldStartVnode不存在，则直接跳过，比对下一个
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // 如果新前与旧前节点相同，就把两个节点进行patch更新
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // 如果新后与旧后节点相同，就把两个节点进行patch更新
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // 如果新后与旧前节点相同，先把两个节点进行patch更新，然后把旧前节点移动到oldChilren中所有未处理节点之后
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // 如果新前与旧后节点相同，先把两个节点进行patch更新，然后把旧后节点移动到oldChilren中所有未处理节点之前
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // 如果不属于以上四种情况，就进行常规的循环比对patch
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        // 如果在oldChildren里找不到当前循环的newChildren里的子节点
        if (isUndef(idxInOld)) { // New element
          // 新增节点并插入到合适位置
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          // 如果在oldChildren里找到了当前循环的newChildren里的子节点
          vnodeToMove = oldCh[idxInOld]
          // 如果两个节点相同
          if (sameVnode(vnodeToMove, newStartVnode)) {
            // 调用patchVnode更新节点
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
            oldCh[idxInOld] = undefined
            // canmove表示是否需要移动节点，如果为true表示需要移动，则移动节点，如果为false则不用移动
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx > oldEndIdx) {
      /**
       * 如果oldChildren比newChildren先循环完毕，
       * 那么newChildren里面剩余的节点都是需要新增的节点，
       * 把[newStartIdx, newEndIdx]之间的所有节点都插入到DOM中
       */
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      /**
       * 如果newChildren比oldChildren先循环完毕，
       * 那么oldChildren里面剩余的节点都是需要删除的节点，
       * 把[oldStartIdx, oldEndIdx]之间的所有节点都删除
       */
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }

```

