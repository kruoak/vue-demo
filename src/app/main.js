'use strict'

import Vue from 'vue'
import Router from 'vue-router'

import App from './system/app.vue'

Vue.use(Router)
Vue.use(require('vue-resource'))
//Vue.use(require('keen-ui'))
Vue.use(require('ns-ui'))

var router = new Router()

router.map(require('./system/routes'))

router.beforeEach(function () {
  window.scrollTo(0, 0)
})

router.redirect({
  '*': '/'
})

Vue.http.interceptors.push({
  response: function (res) {
    if (res.data && res.data.session===false) {
      this.$dispatch('session-timeout')
    }
    return res
  }
})

Vue.filter('numberFormat', {
  read: function(val,digit) {
    if (typeof val === 'number') {
      return val.toFixed(digit||2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
    }
    return ''
  },
  write: function(val, oldValue) {
    var number = +val.replace(/[^\d.\-]/g, '')
    return isNaN(number) ? 0 : parseFloat(number.toFixed(2))
  }
})

router.start(App, '#app')
