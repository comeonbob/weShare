---
title: Flex
date: 2017-10-12 23:09:33
tags: Flex
---

**目前常见的布局方式有固定布局，流动布局，css3增加了弹性布局。**

所谓固定布局，就是网站的内容宽度是一定的，即容器的宽度是固定的，容器内的块宽度是像素

或者百分百，无论怎样缩放网页，容器的宽度始终不变。

所谓流动布局，也叫流体布局，即容器的宽度一般设为百分百的形式，根据屏幕的分辨率网页适应

不同的宽度。

<!--more-->

以前网站设计大多采用这两种，但随着移动端的发展，各种各样的屏幕分辨率需要适应时，这两种

布局也出现了明显的缺点，首先，固定布局若屏幕宽度小于容器宽度时，会出现滚动条，甚至直接

无法展示，而流动布局若在屏幕分辨率很小时，会给用户很不好的体验，因此，弹性布局应运而生。

## 弹性布局

所谓弹性布局，即可根据屏幕大小调节容器大小，开发者无需固定容器内块的宽度，只需声明其布局

行为，比如，横向排列，纵向排列，元素间隔，对齐方式，空间分配等。

例1：

![](./flexbox.png)

上面是一个导航菜单，有三个选项，若此时产品经理要求我们去除第二个选项，只保留另外两个，我们

分别从三种布局分析：

#### 固定布局：宽度固定，去除第二个，总宽度也得跟着改变，影响页面布局。

#### 流动布局：去除第二个，宽度需由原先的33.33%改为50%左右，改动大。

以上两种布局，改动HTML的同时，还得改动css，麻烦，让我们看看弹性布局的写法。

```
<div class="flexbox"> 
    <div>游戏列表</div>
    <div>个人中心</div>
    <div>申请服务</div>
</div>

.flexbox {
    width: 600px;
    margin-top: 100px;
    border: 1px solid red;
    justify-content: space-around;
    align-items: center;
    display: flex;
}
.flexbox div {
    flex: 1;
    text-align: center;
    border-right: 1px solid red;
}
.flexbox > div:last-child {
	border-right: none;
}
```

在flex布局中，我们可以为子元素指定flex: 1定义所占空间大小，若子元素为3，则分成3份，若去除第二个选项，

则另外两个各占1/2，使用方便。

![](./flexbox2.png)

## **语法:**

<font color=red>采用Flex布局的元素称为Flex容器，以下简称容器。容器内的子元素称为Flex项目，以下简称项目。</font>

```
.flexbox {
  display：flex;
  display: -weblit-flex;	//WebKit内核
}
```

上面讲元素设为Flex容器,容器内有水平的主轴和垂直的纵轴。

另外，Flex容器内的项目的float,vertical-align,clear属性都会失效。

#### 容器的属性：

```
// 设置主轴方向
flex-direction: row | row-reverse | column | column-reverse;
// 轴线上的项目是否换行
flex-wrap: nowrap | wrap | wrap-reverse;
// 简写flex-direction和flex-wrap
flex-flow: flex-direction || flex-wrap;
// 项目在主轴的对齐方式
justify-content: flex-start | flex-end | center | space-between | space-around;
// 项目在纵轴的对齐方式
align-items: flex-start | flex-end | center | baseline | stretch;
// 项目在交叉轴的对齐方式
align-content: flex-start | flex-end | center | space-between | space-around | stretch;
```

#### 项目的属性：

```
// 项目的排列顺序。数值越小，排列越靠前，默认为0。
order: <integer>;
// 项目的放大比例，默认为0。
flex-grow: <number>;
// 项目的缩小比例，默认为。
flex-shrink: <number>;
// 项目占据的主轴空间。
flex-basis: <length> | auto;
// flex-grow, flex-shrink 和 flex-basis的简写。
flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ];
// 单个项目有与其他项目不一样的对齐方式。
align-self: auto | flex-start | flex-end | center | baseline | stretch;
```

经典案例：骰子的实现:

![](./dice.png)

```
	HTML:
	<div class="content">
		<div class="first-dice">
			<div class="dot"></div>
		</div>
		<div class="second-dice">
			<div class="dot"></div>
			<div class="dot"></div>
		</div>
		<div class="third-dice">
			<div class="dot"></div>
			<div class="dot"></div>
			<div class="dot"></div>
		</div>
		<div class="fourth-dice">
			<div class="column">
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
			<div class="column">
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
		</div>
		<div class="fifth-dice">
			<div class="column">
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
			<div class="column">
				<div class="dot"></div>
			</div>
			<div class="column">
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
		</div>
		<div class="sixth-dice">
			<div class="column">
				<div class="dot"></div>
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
			<div class="column">
				<div class="dot"></div>
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
		</div>
	</div>
```

```
		CSS:
		.content {
			display: flex;
			width: 800px;
			flex-direction: row;
			justify-content: space-around;
			background-color: #000;
		}
		[class$="dice"] {
			width: 100px;
			height: 100px;
			background-color: #e7e7e7;
			border-radius: 10%;
			margin: 10px 0;
			padding: 3px;
			box-shadow:
		    inset 0 5px white, 
		    inset 0 -5px #bbb,
		    inset 5px 0 #d7d7d7, 
		    inset -5px 0 #d7d7d7;
		}
		.dot {
			display: block;
		    width: 24px;
		    height: 24px;
		    border-radius: 50%;
		    margin: 4px;
		    background-color: #333;
		    box-shadow: inset 0 3px #111, inset 0 -3px #555;
		}
		.first-dice {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.second-dice {
			display: flex;
			justify-content: space-between;
		}
		.second-dice .dot:nth-of-type(2) {
			align-self: flex-end;
		}
		.third-dice {
			display: flex;;
			justify-content: center;
		}
		.third-dice .dot:nth-of-type(3) {
			align-self: flex-end;
		}
		.third-dice .dot:nth-of-type(2) {
			align-self: center;
		}
		.fourth-dice,.fifth-dice, .sixth-dice {
			display: flex;
			justify-content: space-between;
		}
		.fourth-dice .column, .fifth-dice .column, .sixth-dice .column {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}
		.fifth-dice .column:nth-of-type(2) {
			align-self: center;
		}
```

详细用法可查看[阮一峰Flex 布局教程](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)