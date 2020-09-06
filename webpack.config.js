'use strict';

const path = require('path');

module.exports = {
  mode: 'development',
  entry: './main.js',
  devServer: {
    contentBase: path.join(__dirname, 'dist')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader?cacheDirectory',
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'react': path.resolve(__dirname, 'src'),
    }
  },
  plugins: [
  ]
};
