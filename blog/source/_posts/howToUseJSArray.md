---
title: 如何在 JavaScript 中更好地使用数组
categories: Ring
tags: JS
date: "2018-09-29"
---

数组原型方法有很多：
```
join()
push()和pop()
shift() 和 unshift()
sort()
reverse()
concat()
slice()
splice() 
isArray()  toString()
indexOf()和 lastIndexOf() 
forEach() 
map() 
filter() 
every() 
some() 
reduce()和 reduceRight()
from()
of()
copyWithin()
entries()
keys()
values()
inludes()
```

#### 合并数组
```javascript
let arr1 = [0, 1, 2];
let arr2 = [3, 4, 5];
arr1.concat(arr2)
console.log(arr1)
console.log(arr1.concat(arr2))

arr1.push(...arr2);
console.log(arr1)

var arr1 = ['a', 'b'];
var arr2 = ['c'];
var arr3 = ['d', 'e'];


// ES5的合并数组
arr1.concat(arr2, arr3);
// [ 'a', 'b', 'c', 'd', 'e' ]

// ES6的合并数组
[...arr1, ...arr2, ...arr3]
// [ 'a', 'b', 'c', 'd', 'e' ]

console.log([...arr1, ...arr2, ...arr3])

```


#### 复制数组(克隆数组，修改a2，a1不会改变)
```javascript
const a1 = [1, 2];
const a2 = a1;
a2.push(3)

const a3 = [...a1]
a3.push(4)

console.log(a1)
console.log(a2)
console.log(a3)
```


#### includes()、indexOf() (使用 Array.includes 替代 Array.indexOf)
includes() 数组实例的 方法返回一个布尔值，表示某个数组是否包含给定的值，与字符串的includes方法类似。该方法的第二个参数表示搜索的起始位置，默认为0。如果第二个参数为负数，则表示倒数的位置，如果这时它大于数组长度（比如第二个参数为-4，但数组长度为3），则会重置为从0开始
 
 在 MDN 文档中，对 Array.indexOf 的描述是：返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回-1。因此，如果在之后的代码中需要用到（给给定元素的）索引，那么 Array.indexOf 是不二之选。

 indexOf方法有两个缺点，一是不够语义化，它的含义是找到参数值的第一个出现位置，所以要去比较是否不等于-1，表达起来不够直观。
二是，它内部使用严格相等运算符（===）进行判断，这会导致对NaN的误判。

然而，如果我们仅需要知道数组中是否包含给定元素呢？这意味着只是是与否的区别，这是一个布尔问题（boolean question）。针对这种情况，我建议使用直接返回布尔值的 Array.includes。

```javascript

[1, 2, 3].includes(2)     // true
[1, 2, 3].includes(4)     // false
[1, 2, NaN].includes(NaN) // true
[1, 2, 3].includes(3, 3);  // false
[1, 2, 3].includes(3, -1); // true
[1, 2, 3].indexOf(2)  //1

[NaN].indexOf(NaN)
// -1
[NaN].includes(NaN)
// true

```

#### find()、findIndex()、filter()、every()、some()

find() 数组实例的 用于找出第一个符合条件的数组成员。它的参数是一个回调函数，所有数组成员依次执行该回调函数，直到找出第一个返回值为true的成员，然后返回该成员。如果没有符合条件的成员，则返回undefined

findIndex() 数组实例的findIndex方法的用法与find方法非常类似，返回第一个符合条件的数组成员的位置，如果所有成员都不符合条件，则返回-1

filter()：“过滤”功能，数组中的每一项运行给定函数，返回满足过滤条件组成的数组。

every()：判断数组中每一项都是否满足条件，只有所有项都满足条件，才会返回true。

some()：判断数组中是否存在满足条件的项，只要有一项满足条件，就会返回true。

```javascript

let arr = [1, 4, -5, 10]
console.log(arr.find((n) => n < 0)) // -5

[1, 5, 10, 15].find(function(value, index, arr) {
  return value > 9;
}) // 10

[1, 5, 10, 15].findIndex(function(value, index, arr) {
  return value > 9;
}) // 2

[NaN].indexOf(NaN)
// -1

[NaN].findIndex(y => Object.is(NaN, y))
// 0

var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var arr2 = arr.filter(function(x, index) {
  return index % 3 === 0 || x >= 8;
}); 
console.log(arr2); //[1, 4, 7, 8, 9, 10]


var arr = [1, 2, 3, 4, 5];
var arr2 = arr.every(function(x) {
return x < 10;
}); 
console.log(arr2); //true
var arr3 = arr.every(function(x) {
return x < 3;
}); 
console.log(arr3); // false


var arr = [1, 2, 3, 4, 5];
var arr2 = arr.some(function(x) {
return x < 3;
}); 
console.log(arr2); //true
var arr3 = arr.some(function(x) {
return x < 1;
}); 
console.log(arr3); // false

```

#### 使用 Array.find 替代 Array.filter
Array.filter 是一个十分有用的方法。它通过回调函数过滤原数组，并将过滤后的项作为新数组返回。正如它的名字所示，我们将这个方法用于过滤，（一般而言）会获得一个长度更短的新数组。

然而，如果知道经回调函数过滤后，只会剩余唯一的一项，那么我不建议使用 Array.filter。比如：使用等于某个唯一 ID 为过滤条件去过滤一个数组。在这个例子中，Array.filter 返回一个仅有一项的新数组。然而，我们仅仅是为了获取 ID 为特定 ID 的那一项，这个新数组显得毫无用处。

让我们讨论一下性能。为了获取所有符合回调函数过滤条件的项，Array.filter 必须遍历整个数组。如果原数组中有成千上万项，回调函数需要执行的次数是相当多的。

为避免这些情况，我建议使用 Array.find。它与 Array.filter 一样需要一个回调函数，（但只是返回）符合条件的第一项。当找到符合回调函数过滤条件的第一个元素时，它会立即停止往下的搜寻。不再遍历整个数组。

```javascript
const characters = [
  { id: 1, name: 'ironman' },
  { id: 2, name: 'black_widow' },
  { id: 3, name: 'captain_america' },
  { id: 4, name: 'captain_america' },
];
function getCharacter(name) {
  return character => character.name === name;
}
console.log(characters.filter(getCharacter('captain_america')));
// [
//   { id: 3, name: 'captain_america' },
//   { id: 4, name: 'captain_america' },
// ]
console.log(characters.find(getCharacter('captain_america')));
// { id: 3, name: 'captain_america' }

```

#### Array.some 替代 Array.find

在上面的例子中，我们知道 Array.find 需要一个回调函数作为参数，并返回（符合条件的）第一个元素。然而，当我们需要知道数组中是否存在一个元素时，Array.find 是最好的选择吗？不一定是，因为它返回一个元素，而不是一个布尔值。

在下面的例子中，我建议使用 Array.some，它返回你需要的布尔值。

```javascript
const characters = [
  { id: 1, name: 'ironman', env: 'marvel' },
  { id: 2, name: 'black_widow', env: 'marvel' },
  { id: 3, name: 'wonder_woman', env: 'dc_comics' },
];
function hasCharacterFrom(env) {
  return character => character.env === env;
}
console.log(characters.find(hasCharacterFrom('marvel')));
// { id: 1, name: 'ironman', env: 'marvel' }
console.log(characters.some(hasCharacterFrom('marvel')));
// true
```
> 译者注：补充一下 Array.some 与 Array.includes 使用上的区别。两者都返回一个布尔值，表示某项是否存在于数组之中，一旦找到对应的项，立即停止遍历数组。不同的是 Array.some 的参数是回调函数，而 Array.includes 的参数是一个值（均不考虑第二个可选参数）。
> 
> 假设希望知道值为 value 的项是否存在于数组中，既可以编写代码：[].includes(value)， 也可以给 Array.some 传入 item => item === value 作为回调函数。Array.includes 使用更简单，Array.some 可操控性更强。


#### 使用 Array.reduce 替代 Array.filter 与 Array.map 的组合
> reduce() 方法接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值。
事实上说，Array.reduce 不太容易理解。然而，如果我们先使用 Array.filter 过滤原数组，之后（对结果）再调用 Array.map （以获取一个新数组）。这看起似乎有点问题，是我们忽略了什么吗？
在上面的例子中，我们使用了 Array.map，（但更）建议使用累加器为待拼接数组的 Array.reduce 。在下面的例子中，根据变量 env 的值，我们会将它加进累加器中或保持累加器不变（即不作任何处理）。


```javascript
const characters = [
  { name: 'ironman', env: 'marvel' },
  { name: 'black_widow', env: 'marvel' },
  { name: 'wonder_woman', env: 'dc_comics' },
];
console.log(
  characters.filter(character => character.env === 'marvel')
    .map(character => Object.assign({}, character, { alsoSeenIn: ['Avengers'] }))
);
// [
//   { name: 'ironman', env: 'marvel', alsoSeenIn: ['Avengers'] },
//   { name: 'black_widow', env: 'marvel', alsoSeenIn: ['Avengers'] }
// ]
console.log(
  characters.reduce((acc, character) => {
      return character.env === 'marvel'
        ? acc.concat(Object.assign({}, character, { alsoSeenIn: ['Avengers'] }))
        : acc;
    }, [])
)
// [
//   { name: 'ironman', env: 'marvel', alsoSeenIn: ['Avengers'] },
//   { name: 'black_widow', env: 'marvel', alsoSeenIn: ['Avengers'] }
// ]
```
这样做的问题是：我们遍历了两次数组。第一次是过滤原数组以获取一个长度稍短的新数组，第二次遍历（译者注：指 Array.map）是对 Array.filter 的返回的新数组进行加工，再次创造了一个新数组！为得到最终的结果，我们结合使用了两个数组方法。每个方法都有它自己的回调函数，而且供 Array.map 使用的临时数组是由 Array.filter 提供的，（一般而言）该数组无法复用。

为避免如此低效场景的出现，我的建议是使用 Array.reduce 。一样的结果，更好的代码！Array.reduce 允许你将过滤后切加工过的项放进累加器中。累加器可以是需要待递增的数字、待填充的对象、 待拼接的字符串或数组等。