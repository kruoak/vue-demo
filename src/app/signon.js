'use strict'

import Vue from 'vue'
import Router from 'vue-router'

import App from './signon/app.vue'

Vue.use(Router)
Vue.use(require('vue-resource'))
//Vue.use(require('keen-ui'))

var router = new Router()

router.map(require('./signon/routes'))

router.beforeEach(function () {
  window.scrollTo(0, 0)
})

router.redirect({
  '*': '/'
})

router.start(App, '#app')
