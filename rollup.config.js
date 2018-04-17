import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'

const env = process.env.NODE_ENV
const config = {
  input: 'src/index.js',
  plugins: []
}

if (env === 'es' || env === 'cjs') {
  config.output = { format: env }
  config.external = ['symbol-observable']
  config.plugins.push(
    babel({
      plugins: ['external-helpers'],
    })
  )
}

if (env === 'development' || env === 'production') {
  config.output = { format: 'umd' }
  config.name = 'martian-middleware'
  config.plugins.push(
    nodeResolve({
      jsnext: true
    }),
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  );

  config.plugins.push(commonjs({
    // non-CommonJS modules will be ignored, but you can also
    // specifically include/exclude files
    // include: 'node_modules/**',  // Default: undefined
    // exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],  // Default: undefined
    // these values can also be regular expressions
    // include: /node_modules/

    // search for files other than .js files (must already
    // be transpiled by a previous plugin!)
    extensions: [ '.js', '.coffee' ],  // Default: [ '.js' ]

    // if true then uses of `global` won't be dealt with by this plugin
    ignoreGlobal: false,  // Default: false

    // if false then skip sourceMap generation for CommonJS modules
    sourceMap: false,  // Default: true

    // explicitly specify unresolvable named exports
    // (see below for more details)
    namedExports: {
      './src/apiMiddleware.js': ['API_MW_SYMBOL', 'apiMiddleware', 'setNetAvailable', 'addEvent', 'removeEvent' ],
      './src/errorMiddleware.js': ['errorMiddleware', 'registerErrorHandler'],
      './src/populateHttpHeaderMiddleware.js': ['genPopulateHttpHeaderMiddleware', 'POPULATE_HTTP_HEADER_MW_SYMBOL'],
    },  // Default: undefined

    // sometimes you have to leave require statements
    // unconverted. Pass an array containing the IDs
    // or a `id => boolean` function. Only use this
    // option if you know what you're doing!
    ignore: [ 'conditional-runtime-dependency' ]
  }))
}

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config
