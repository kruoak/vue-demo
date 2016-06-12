'use strict'

module.exports = {
  '/': {
    component: require('./signin-page.vue'),
  },
  '/forgot': {
    component: {
      template: '<h1>FORGOT</h1>'
    }
  }
}
