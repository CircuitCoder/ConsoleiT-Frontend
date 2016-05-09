module.exports = {
  cache: true,

  resolve: {
    root: __dirname,
    extensions: ['', '.ts', '.js'],
    modulesDirectories: ['node_modules'],
    alias: {
      '@angular/common': '@angular/common/common.umd.js',
      '@angular/compiler': '@angular/compiler/compiler.umd.js',
      '@angular/core': '@angular/core/core.umd.js',
      '@angular/http': '@angular/http/http.umd.js',
      '@angular/platform-browser': '@angular/platform-browser/platform-browser.umd.js',
      '@angular/platform-browser-dynamic': '@angular/platform-browser-dynamic/platform-browser-dynamic.umd.js',
      '@angular/router': '@angular/router/router.umd.js',
      '@angular/router-deprecated': '@angular/router-deprecated/router-deprecated.umd.js',
    },
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        exclude: [/\.(spec|e2e)\.ts$/]
      },

      {
        test: /\.html$/,
        loader: 'raw-loader',
        exclude: ['html/index.html', 'html/offline.html']
      }
    ]
  },

  devtool: 'source-map',

  output: {
    filename: 'bundle.js',
    sourceMapFilename: 'bundle.map',
    chunkFilename: '[chunkhash].js',
  }
}
