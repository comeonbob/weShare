#### 目录介绍 List
```js
src
├── app.vue
├── index.js
├── index.less
├── router.js
└── components
├──   ├── Home.vue
├──   └── ...
└── assets
      └── ...
```


##### 运行 Run
```
git clone https://github.com/vueadmin/parcel-vue.git

npm i

npm run dev
```

##### 编译 Build
```
npm run build
```


#### 可能遇到的错误
(1) 运行npm run dev 后'targets of undefined', parcel-bundler源码的问题, 作者已更新: https://github.com/parcel-bundler/parcel/pull/886
(2) 运行后，浏览器控制台报错，vue引入和渲染方式不同，编译错误。详见： https://www.npmjs.com/package/parcel-plugin-vue
(3) 编译错误，提示node版本问题，node版本需要大于 8.0