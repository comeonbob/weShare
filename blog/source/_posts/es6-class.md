---
title: es6 类class入门
categories: Bob
tags: JS
date: "2018-05-31"
---

### 什么是类?

> 类是面向对象程序设计中的概念，是面向对象编程的基础。   - - 百度百科

简单介绍下，面向对象编程中几个基本概念：
#### （1）对象
一切事物皆为对象，生活中看到的，听到的，闻到的等东西都是对象。准确的说， 对象是一个自包含的实体，用一组可识别的特性和行为来标识。
#### （2）类
**定义：**
类是对现实生活中一类具有共同特征的事物的抽象， 换句话说，类就是具有相同属性和功能的对象的抽象的集合；
类的构成包括数据成员和成员函数。
**三大特性：**

 - 封装性
将数据和操作封装为一个有机的整体，由于类中私有成员都是隐藏的，只向外部提供有限的接口，所以能够保证内部的高内聚性和与外部的低耦合性。

 - 继承性
继承定义了类如何相互关联，共享特性；更符合认知规律，使程序更易于理解，同时节省不必要的重复代码。

 - 多态性
多态表示不同的对象可以执行相同的动作，但要通过自己的实现代码来执行。

#### （3）构造方法
构造方法，又叫构造函数，其实就是对类的初始化， 在 new 的时候调用。

### 如何使用es6新特性class
**demo:**
(1) es6 面向对象的写法
```javascript
/** 基类: 人 */
class Person{
  // 默认构造方法
  constructor(name, gender) {
    this.name = name;
    this.gender = gender;
  }

  // 获取个人信息
  getInfo() {
	return `姓名：${this.name}, 性别：${this.gender}`;
  }
}
// 实例化
let someOne = new Person("Bob", "male");
// 输出个人信息
console.log(someOne.getInfo());
```
```
/** 派生类：超人 */
class Superman extends Person {
   // 构造函数
   constructor(name, gender, ability) {
     super(name, gender);
     this.ability = ability;
   }
  // 获取个人信息
  getInfo() {
	return `姓名：${this.name}, 性别：${this.gender}, 能力：${this.ability}`;
  }
}
// 实例化
let someSuperman = new Superman('enfan', 'male', '会飞');
// 输出超人信息
console.log(someSuperman.getInfo());
```
(2) es5语法
```javascript
function Person(name, gender){
    this.name = name;
    this.gender = gender;
}
Person.prototype.getInfo = function(){
    console.log(this.name + ' ' + this.gender);
}
var someOne = new Person("Bob", "male");
someOne.getInfo();
```
思考： es5 继承如何实现？

```javascript
function SuperMan(name, gender, ability){
  Person.call(this, name, gender);
  this.ability = ability;
}
SuperMan.prototype = new Person();
SuperMan.prototype.constructor = SuperMan;
var someSuperman = new SuperMan('enfan', 'male', 'fly');
someSuperman.getInfo();
```

（3）对比es6 与 es5

- 类的调用必须通过new 一个实例,且类的内部默认使用严格模式
- 类的继承使用关键字extends,继承机制与es5完全不同
- 类的继承可以继承原生的构造函数，es5不可以
- 不存在变量提升，必须先声明，再调用


### 为什么要用es6 class？
- 更接近传统语言（比如c++, java）的面向对象编程写法，引入了 class（类）这个概念
- 使用更多设计模式
- 越来越多的库使用class， 如koa2
- more...

---
- Date :   2018-05-31
- Author : Bob
