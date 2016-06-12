'use strict'

module.exports = {
  '/': {
    component: require('./app-index.vue'),
  },
  '/profile': require('./profile/routes.js'),
  '/setting': require('../setting/routes.js'),
}
