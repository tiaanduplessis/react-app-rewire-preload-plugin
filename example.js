
const rewirePreloadPlugin = require('@tiaanduplessis/react-app-rewire-preload-plugin')

module.exports = function override(config, env) {

  config = rewirePreloadPlugin(config, env)

  return config
}
