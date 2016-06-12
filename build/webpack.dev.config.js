'use strict';

const webpackConfig = require('./webpack.base.config');
const config = require('../src/config');

webpackConfig.devtool = 'eval-source-map';

webpackConfig.devServer = {
  noInfo: false,
  port: 3000,
  proxy: {
    '*': 'http://localhost:' + config.server.port
  },
  contentBase: './dist/public',
  publicPath: '/js/',
}

module.exports = webpackConfig;
