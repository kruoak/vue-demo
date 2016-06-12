'use strict';

const core = [
  'vue', 'vue-router', 'vue-resource'
];

const vendors = [
  'ns-ui', 'moment', 'q'
];

module.exports = {
  entry: {
    main: './src/app/main.js',
    signon: './src/app/signon.js',
    core,
    vendors,
  },
  output: {
    path: './dist/public/js',
    publicPath: '/js/',
    filename: '[name].js',
    chunkFilename: '[name]-[chunkhash].js',
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue'
      },
      {
        test: /\.js$/,
        loader: 'babel?compact=false',
        exclude: /node_modules/
      },
      // {
      //   // edit this for additional asset file types
      //   test: /\.(png|jpg|gif)$/,
      //   loader: 'url',
      //   query: {
      //     // inline files smaller then 10kb as base64 dataURL
      //     limit: 10000,
      //     // fallback to file-loader with this naming scheme
      //     name: '[name].[ext]?[hash]'
      //   }
      // }
    ]
  },
  // vue-loader config:
  // lint all JavaScript inside *.vue files with ESLint
  // make sure to adjust your .eslintrc
  vue: {
    loaders: {
      js: 'babel',
      scss: 'style!css!sass',
    }
  },
  babel: {
    presets: ['es2015'],
    plugins: ['transform-runtime']
  }
}
