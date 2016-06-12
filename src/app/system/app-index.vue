<template>
  <div class="page">
    <div class="app-content">
      <h1>Welcome</h1>
    </div>
  </div>
</template>

<script>
module.exports = {
  ready: function() {
    this.$dispatch('set-title', 'HOME')
    if (this.$route.path == '/' || this.$route.path.substr(0,5)=='/home') {
      this.$dispatch('set-menu', [
        {type:'header',text:'ระบบงาน'},
        {text:'Setting',path:'/setting',icon:'favorite_border'},
      ])
    }

  }
}
</script>
