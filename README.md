
# @tiaanduplessis/react-app-rewire-preload-plugin
[![package version](https://img.shields.io/npm/v/@tiaanduplessis/react-app-rewire-preload-plugin.svg?style=flat-square)](https://npmjs.org/package/@tiaanduplessis/react-app-rewire-preload-plugin)
[![package downloads](https://img.shields.io/npm/dm/@tiaanduplessis/react-app-rewire-preload-plugin.svg?style=flat-square)](https://npmjs.org/package/@tiaanduplessis/react-app-rewire-preload-plugin)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![package license](https://img.shields.io/npm/l/@tiaanduplessis/react-app-rewire-preload-plugin.svg?style=flat-square)](https://npmjs.org/package/@tiaanduplessis/react-app-rewire-preload-plugin)
[![make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Add [preload-webpack-plugin](https://github.com/GoogleChromeLabs/preload-webpack-plugin) your [react-app-rewired](https://github.com/timarney/react-app-rewired) configuration

## Table of Contents

- [Usage](#usage)
- [Install](#install)
- [Contribute](#contribute)
- [License](#License)

## Usage

```js

const rewirePreloadPlugin = require('@tiaanduplessis/react-app-rewire-preload-plugin')

module.exports = function override(config, env) {

  config = rewirePreloadPlugin(config, env)

  return config
}

```


## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com).

```sh
$ npm install @tiaanduplessis/react-app-rewire-preload-plugin
$ # OR
$ yarn add @tiaanduplessis/react-app-rewire-preload-plugin
```

## Contribute

1. Fork it and create your feature branch: `git checkout -b my-new-feature`
2. Commit your changes: `git commit -am "Add some feature"`
3. Push to the branch: `git push origin my-new-feature`
4. Submit a pull request

## License

MIT
