const PreloadPlugin = require('preload-webpack-plugin')

function rewirePreloadPlugin (config, env, opts = {}) {
  config.plugins = Array.isArray(config.plugins) ? [...config.plugins, new PreloadPlugin(opts)] : [new PreloadPlugin(opts)]

  return config
}

module.exports = rewirePreloadPlugin
