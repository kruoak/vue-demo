'use strict'

module.exports = {
  component: resolve => require(['./index.vue'], resolve),
  subRoutes: {
    '/': {
      component: resolve => require(['./home.vue'], resolve),
    },
    '/site-type': {
      name:'site-type',
      component: resolve => require(['./site-type.vue'], resolve),
    },
    '/site-type/:code': {
      name:'site-type-edit',
      component: resolve => require(['./site-type-edit.vue'], resolve),
    },
    '/category-type': {
      name:'cat-type',
      component: resolve => require(['./category-type.vue'], resolve)
    },
    '/method-type': {
      component: resolve => require(['./method-type.vue'], resolve),
    },
  }
}
