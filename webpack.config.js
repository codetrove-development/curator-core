const merge = require('webpack-merge')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const baseConfig = {
  context: __dirname,
  devtool: 'source-map',
  entry: {
    snapperCore: './src/snapper-core',
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
  output: {
    path: __dirname + "/build",
    filename: "snapper-core.js",
    libraryTarget: "umd",
    library: "SnapperCore"
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
    filename: "snapper-core.min.js",
    libraryTarget: "umd",
    library: "SnapperCore"
  }
})

module.exports = ( env, argv ) => {
  if ( argv.mode === 'development' ) {
    return devConfig
  }

  return prodConfig
}