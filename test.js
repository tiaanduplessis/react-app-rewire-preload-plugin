const assert = require('assert')
const rewirePreloadPlugin = require('./')
const PreloadPlugin = require('preload-webpack-plugin')
const lodash = require('lodash')
const template = require('lodash/template')
const fromPairs = require('lodash/fromPairs')

let passed = 0
function test (name, check) {
  check()
  passed++
  console.log('ok - ' + name)
}

test('exports a rewire function and returns the original config', () => {
  assert.strictEqual(typeof rewirePreloadPlugin, 'function')
  const config = { mode: 'production', output: { publicPath: '/assets/' } }
  assert.strictEqual(rewirePreloadPlugin(config, 'production'), config)
  assert.strictEqual(config.mode, 'production')
  assert.deepStrictEqual(config.output, { publicPath: '/assets/' })
  assert.strictEqual(config.plugins.length, 1)
  assert(config.plugins[0] instanceof PreloadPlugin)
})

test('preserves existing plugin instances and does not mutate their array', () => {
  const first = { name: 'first' }
  const second = { name: 'second' }
  const plugins = Object.freeze([first, second])
  const config = { plugins }
  rewirePreloadPlugin(config, 'development')
  assert.deepStrictEqual(plugins, [first, second])
  assert.notStrictEqual(config.plugins, plugins)
  assert.strictEqual(config.plugins[0], first)
  assert.strictEqual(config.plugins[1], second)
  assert(config.plugins[2] instanceof PreloadPlugin)
  assert.strictEqual(config.plugins.length, 3)
})

test('handles empty and non-array plugin configurations', () => {
  for (const plugins of [[], undefined, null, false, {}]) {
    const config = { plugins }
    rewirePreloadPlugin(config, 'production')
    assert.strictEqual(config.plugins.length, 1)
    assert(config.plugins[0] instanceof PreloadPlugin)
  }
})

test('forwards options without modifying them and retains plugin defaults', () => {
  const as = file => file.endsWith('.css') ? 'style' : 'script'
  const options = Object.freeze({ include: 'allChunks', as, fileWhitelist: [/\.js$/] })
  const config = rewirePreloadPlugin({}, 'production', options)
  const actual = config.plugins[0].options
  assert.strictEqual(actual.include, options.include)
  assert.strictEqual(actual.as, as)
  assert.strictEqual(actual.fileWhitelist, options.fileWhitelist)
  assert.strictEqual(actual.rel, 'preload')
  assert.deepStrictEqual(Object.keys(options), ['include', 'as', 'fileWhitelist'])
  assert.strictEqual(rewirePreloadPlugin({}, 'production').plugins[0].options.include, 'asyncChunks')
})

test('creates distinct plugin instances on successive calls', () => {
  const config = rewirePreloadPlugin({}, 'production')
  const first = config.plugins[0]
  rewirePreloadPlugin(config, 'production', { rel: 'prefetch' })
  assert.strictEqual(config.plugins.length, 2)
  assert.strictEqual(config.plugins[0], first)
  assert.notStrictEqual(config.plugins[1], first)
  assert.strictEqual(first.options.rel, 'preload')
  assert.strictEqual(config.plugins[1].options.rel, 'prefetch')
})

test('real plugin registers the Webpack 4/HTML plugin 3 hook and renders links', () => {
  const plugin = rewirePreloadPlugin({}, 'production').plugins[0]
  let processHtml
  const compilation = {
    outputOptions: { publicPath: '/assets/' },
    chunks: [
      { files: ['main.js'], canBeInitial: () => true },
      { files: ['lazy.js', 'lazy.css', 'lazy.js.map', 'lazy.js'], canBeInitial: () => false }
    ],
    hooks: {
      htmlWebpackPluginAfterHtmlProcessing: {
        tapAsync: (name, callback) => {
          assert.strictEqual(name, 'PreloadPlugin')
          processHtml = callback
        }
      }
    }
  }
  plugin.apply({
    hooks: {
      compilation: {
        tap: (name, callback) => {
          assert.strictEqual(name, 'PreloadPlugin')
          callback(compilation)
        }
      }
    }
  })
  const data = { html: '<html><head></head><body></body></html>', plugin: { options: { filename: 'index.html' } } }
  let callbacks = 0
  processHtml(data, (error, result) => {
    assert.ifError(error)
    assert.strictEqual(result, data)
    assert.strictEqual(result.html, '<html><head><link as="style" href="/assets/lazy.css" rel="preload"><link as="script" href="/assets/lazy.js" rel="preload"></head><body></body></html>')
    callbacks++
  })
  assert.strictEqual(callbacks, 1)
})

test('real plugin honors prefetch, filtering, and excluded HTML options', () => {
  const options = { rel: 'prefetch', include: 'allChunks', fileWhitelist: [/\.js$/], excludeHtmlNames: ['skip.html'] }
  const plugin = rewirePreloadPlugin({}, 'production', options).plugins[0]
  const compilation = { outputOptions: { publicPath: '/' }, chunks: [{ files: ['main.js', 'main.css'] }] }
  const data = { html: '<head></head>', plugin: { options: { filename: 'index.html' } } }
  assert.strictEqual(plugin.addLinks(compilation, data).html, '<head><link href="/main.js" rel="prefetch"></head>')
  const excluded = { html: '<head></head>', plugin: { options: { filename: 'skip.html' } } }
  assert.strictEqual(plugin.addLinks(compilation, excluded).html, '<head></head>')
})

test('monolithic and modular templates reject unsafe import names', () => {
  for (const compile of [lodash.template, template]) {
    assert.strictEqual(compile('<%= add(2, 3) %>', { imports: { add: (a, b) => a + b } })({}), '5')
    assert.throws(() => compile('test', { imports: { 'value = 1': undefined } }), /Invalid.*imports/)
  }
})

test('array-wrapped paths cannot delete prototype properties', () => {
  function Fixture () {}
  Fixture.prototype.marker = 'preserved'
  const object = new Fixture()
  lodash.unset(object, [['constructor'], ['prototype'], 'marker'])
  assert.strictEqual(Fixture.prototype.marker, 'preserved')
  lodash.omit(object, [[['constructor'], ['prototype'], 'marker']])
  assert.strictEqual(Fixture.prototype.marker, 'preserved')
})

test('modular fromPairs handles prototype-named keys without regression', () => {
  const value = { marker: true }
  const result = fromPairs([['normal', 1], ['__proto__', value]])
  assert.strictEqual(result.normal, 1)
  assert.strictEqual(Object.getPrototypeOf(result), Object.prototype)
  assert.strictEqual(Object.prototype.hasOwnProperty.call(result, '__proto__'), true)
  assert.strictEqual(Object.getOwnPropertyDescriptor(result, '__proto__').value, value)
})

console.log(passed + ' checks passed')
