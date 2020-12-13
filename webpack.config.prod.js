const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  module: {
    rules: [{
      test: /\.(js)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      }
    }]
  },
  optimization: {
    minimizer: [new TerserPlugin()]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'build/assets',
          to: 'assets'
        }
      ]
    }),
    new HTMLWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      hash: true,
      minify: false,
      meta: { viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no' }
    })
    ]
}