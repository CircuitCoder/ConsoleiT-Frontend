const webpack = require('webpack');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;

module.exports = {
  cache: true,

  entry: {
    main: 'ts/main.ts',
    vendor: 'ts/vendor.ts',
  },

  resolve: {
    root: __dirname,
    extensions: ['', '.ts', '.js'],
    modulesDirectories: ['node_modules'],
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

  devtool: 'source-map',

  output: {
    filename: 'bundle-[name].js',
    sourceMapFilename: 'bundle-[name].map',
    chunkFilename: '[chunkhash].js',
  }
}
