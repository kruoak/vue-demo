<template>
  <router-view></router-view>
</template>

<script>
const helper = require('../../lib/helper');

module.exports = {
  data: function() {
    return {

    }
  },
  ready: function() {
    let menu = [
      {type:'header',text:'รายงาน/ค้นหาข้อมูล'},
      {text:'Dashboard', path:'/setting', icon:'dashboard', isRoot:true},
      {text:'ประเภทหน่วยรับบริจาค', path:'/setting/site-type',icon:'search'},
      {text:'ประเภทสถานที่', path:'/setting/category-type',icon:'find_in_page'},
      {text:'รูปแบบการรับบริจาค', path:'/setting/method-type',icon:'find_in_page'},
    ];
    this.$dispatch('set-menu', menu)
  }
}
</script>
