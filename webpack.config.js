const path = require('path');

module.exports = {
  entry: './entry.js',
  output: {
    path: path.resolve('./'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  watch: true
};
