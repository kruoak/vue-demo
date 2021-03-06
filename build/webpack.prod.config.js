'use strict';

const webpack = require('webpack');
const config = require('./webpack.base.config');

config.plugins = (config.plugins || []).concat([
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  new webpack.optimize.CommonsChunkPlugin({
    names: ['vendors', 'core'], /* order desending */
    minChunks: Infinity
  }),
  new webpack.optimize.OccurenceOrderPlugin()
])

module.exports = config;
