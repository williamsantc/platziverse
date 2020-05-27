'use strict'
const { VueLoaderPlugin } = require('vue-loader')
const TerserPlugin = require('terser-webpack-plugin')
const path = require("path")

module.exports = {
  mode: 'development',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  entry: {
    bundle: './client/app.js'
  },
  output: {
    path: path.resolve(__dirname, "/public"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}