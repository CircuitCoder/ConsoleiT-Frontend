module.exports = {
  cache: true,

  resolve: {
    root: __dirname,
    extensions: ['', '.ts', '.js'],
    modulesDirectories: ['node_modules'],
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
