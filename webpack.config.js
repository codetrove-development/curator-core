const merge = require('webpack-merge')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const baseConfig = {
  context: __dirname,
  entry: {
    'snappy-grid': './src/snappy-grid-core',
    helpers: './src/helpers',
    options: './src/options'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
    ]
  },
}

const devConfig = merge( baseConfig, {
  devtool: 'source-map',
  output: {
    path: __dirname + "/build",
    filename: "[name].js",
    libraryTarget: "umd",
    library: "[name]"
  }
})

const prodConfig = merge( baseConfig, {
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: true,
          ecma: 5,
          mangle: true
        },
        sourceMap: false
      })
    ]
  },
  output: {
    path: __dirname + "/dist",
    filename: "snappy-grid-core.min.js",
    libraryTarget: "umd",
    library: "SnappyGridCore"
  }
})

module.exports = ( env, argv ) => {
  if ( argv.mode === 'development' ) {
    return devConfig
  }

  return prodConfig
}