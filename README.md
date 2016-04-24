## Anker Store Web 前端框架

主要技术框架
> [React Starter Kit](https://github.com/kriasoft/react-starter-kit) 框架
> [React](https://facebook.github.io/react/) 库,
> [Node.js](https://nodejs.org/) / [Express](http://expressjs.com/) 服务器
> and [Flux](http://facebook.github.io/flux/) architecture. Containing
> modern web development tools such as [Webpack](http://webpack.github.io/),
> [Babel](http://babeljs.io/) and [BrowserSync](http://www.browsersync.io/).
> 一套高效开发,同步现时代的最新最优实现的方案.

### 相关文档

  * **版本控制**
    - [Github](https://github.com/oceanwing/anker_store_tablet/)

  * **API文档**
    - [Spree架构](http://ostx.oceanwing.com/)(账号：ostx)(密码ostanker)

### 目录布局

```
.
├── /build/                     # The folder for compiled output
├── /node_modules/              # 3rd-party libraries and utilities
├── /src/                       # The source code of the application
│   ├── /actions/               # Action creators that allow to trigger a dispatch to stores
│   ├── /api/                   # REST API / Relay endpoints
│   ├── /components/            # React components
│   ├── /constants/             # Constants (action types etc.)
│   ├── /content/               # Static content (plain HTML or Markdown, Jade, you name it)
│   ├── /core/                  # Core components (Flux dispatcher, base classes, utilities)
│   ├── /decorators/            # Higher-order React components
│   ├── /public/                # Static files which are copied into the /build/public folder
│   ├── /stores/                # Stores contain the application state and logic
│   ├── /utils/                 # Utility classes and functions
│   ├── /app.js                 # Client-side startup script
│   ├── /config.js              # Global application settings
│   ├── /routes.js              # Universal (isomorphic) application routes
│   ├── /server.js              # Server-side startup script
│   └── /newrelic.js            # Server-side Newrelic alert script
├── /tools/                     # Build automation scripts and utilities
│   ├── /lib/                   # Library for utility snippets
│   ├── /build.js               # Builds the project from source to output (build) folder
│   ├── /bundle.js              # Bundles the web resources into package(s) through Webpack
│   ├── /clean.js               # Cleans up the output (build) folder
│   ├── /config.js              # Webpack configuration for application bundles
│   ├── /copy.js                # Copies static files to output (build) folder
│   ├── /deploy.js              # Deploys your web application
│   ├── /serve.js               # Launches the Node.js/Express web server
│   └── /start.js               # Launches the development web server with "live reload"
│── package.json                # The list of 3rd party libraries and utilities
└── preprocessor.js             # ES6 transpiler settings for Jest
```

### 快速开始

Just clone the repo and start hacking:

```shell
$ git clone git@github.com:oceanwing/anker_store_tablet.git
$ cd anker_store_tablet
$ npm install                   # Install Node.js components listed in ./package.json
$ npm start                     # Compile and launch
```

### 构建发布

```shell
$ npm run build                 # or, `npm run build -- --release`
```

By default, it builds in *debug* mode. If you need to build in release
mode, just add a `-- --release` flag. This will optimize the output bundle for
production.

### 本地打包并运行

```shell
$ npm start                     # or, `npm start -- --release`
```

This will start a light-weight development server with "live reload" and
synchronized browsing across multiple devices and browsers.

### 本地打包+发布到git （暂时没有使用）

```shell
$ npm run deploy                # or, `npm run deploy -- --production`
```
For more information see `tools/deploy.js`.

### 测试工具

Run unit tests powered by [Jest](https://facebook.github.io/jest/) with the following
[npm](https://www.npmjs.org/doc/misc/npm-scripts.html) command:

```shell
$ npm test
```

Test any javascript module by creating a `__tests__/` directory where
the file is. Append `-test.js` to the filename and [Jest](https://facebook.github.io/jest/) will do the rest.

### 相关项目

  * [React Static Boilerplate](https://github.com/koistya/react-static-boilerplate) — Generates static websites from React components
  * [Babel Starter Kit](https://github.com/kriasoft/babel-starter-kit) — Boilerplate for authoring JavaScript/React.js libraries
  * [React Decorators](https://github.com/kriasoft/react-decorators) — A collection of higher-order React components
  * [React Starter Kit](http://github.com/kriasoft/react-starter-kit) - Basic development framework

### 相关知识

  * [Getting Started with React.js](http://facebook.github.io/react/)
  * [Getting Started with GraphQL and Relay](https://quip.com/oLxzA1gTsJsE)
  * [React.js Questions on StackOverflow](http://stackoverflow.com/questions/tagged/reactjs)
  * [React.js Discussion Board](https://discuss.reactjs.org/)
  * [Flux Architecture for Building User Interfaces](http://facebook.github.io/flux/)
  * [Jest - Painless Unit Testing](http://facebook.github.io/jest/)
  * [Flow - A static type checker for JavaScript](http://flowtype.org/)
  * [The Future of React](https://github.com/reactjs/react-future)
  * [Learn ES6](https://babeljs.io/docs/learn-es6/), [ES6 Features](https://github.com/lukehoban/es6features#readme)