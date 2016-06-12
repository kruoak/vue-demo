'use strict'

module.exports = {
  component: resolve => require(['./index.vue'], resolve),
  subRoutes: {
    '/': {
      component: resolve => require(['./home.vue'], resolve),
    },
    '/site-type': {
      component: resolve => require(['./site-type.vue'], resolve),
    },
    '/category-type': {
      component: resolve => require(['./category-type.vue'], resolve)
    },
    '/method-type': {
      component: resolve => require(['./method-type.vue'], resolve),
    },
  }
}
