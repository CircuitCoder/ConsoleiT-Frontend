const webpack = require('webpack');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;

const cache = {};

module.exports = {
  cache: cache,

  entry: {
    main: 'ts/main.ts',
    vendor: 'ts/vendor.ts',
  },

  resolve: {
    root: __dirname,
    extensions: ['', '.ts', '.js'],
    modulesDirectories: ['node_modules'],
    alias: {
      '@angular/common': '@angular/common/bundles/common.umd.min.js',
      '@angular/core': '@angular/core/bundles/core.umd.min.js',
      '@angular/http': '@angular/http/bundles/http.umd.min.js',
      '@angular/platform-browser': '@angular/platform-browser/bundles/platform-browser.umd.min.js',
      '@angular/platform-browser-dynamic': '@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.min.js',
      '@angular/router': '@angular/router/bundles/router.umd.min.js',
      '@angular/router-deprecated': '@angular/router-deprecated/bundles/router-deprecated.umd.min.js',
    }
  },

  module: {
    preLoaders: [
      {
        test: /.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.ts$/,
        loader: "tslint"
      }
    ],

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

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(true),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vendor']
    }),
    new ForkCheckerPlugin(),
  ],

  devtool: 'cheap-module-eval-source-map',

  output: {
    filename: 'bundle-[name].js',
    sourceMapFilename: 'bundle-[name].map',
    chunkFilename: '[chunkhash].js',
  },
}
